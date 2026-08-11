# Arquitetura do Projeto — theCoders Cases

## 1. Visão Geral

O **theCoders Cases** é um simulador de cases em grupo voltado para candidatos
iniciantes em TI (nível Estagiário e Júnior). A aplicação recria, em um ambiente
controlado e cronometrado, a dinâmica de um case técnico/comportamental em
equipe — desde o cadastro do usuário até a avaliação final de desempenho,
gerada com apoio de IA.

O fluxo principal do usuário é:

```
Cadastro/Login → Tutorial (primeiro acesso) → Lobby → Case (cronometrado) → Resultado
```

## 2. Stack Tecnológica

**Front-end**
- React (SPA)
- Vite (build e dev server)
- JavaScript
- React Router (`react-router-dom`) — navegação entre telas
- `socket.io-client` — presente nas dependências, usado hoje só na tela `OnCase`
  para detectar saída de tela cheia/troca de aba (`case:infracao_detectada`) e
  escutar eventos de sincronização de sala (`case:redirecionar_lobby`,
  `case:nova_case`)
- ESLint — padronização de código

> ⚠️ **Incompatibilidade de arquitetura:** o `OnCase` conecta em
> `io("http://localhost:3000")`, mas o back-end real (abaixo) é FastAPI, que
> não expõe um servidor Socket.IO. Ou essa comunicação em tempo real precisa
> ser implementada no back-end (ex: com `python-socketio`), ou a tela precisa
> ser migrada para outra estratégia (polling via REST, Supabase Realtime,
> etc.). Ver detalhes em [`frontend.md`](./frontend.md#7-estado-atual-e-próximos-passos).

**Back-end / API**
- Python 3 + FastAPI
- Supabase (Postgres gerenciado) como banco de dados, acessado via `supabase-py`
- Groq API (`llama-3.3-70b-versatile`) para avaliação de soluções por IA,
  chamada via `httpx` — avalia em 6 categorias (raciocínio lógico, qualidade
  técnica, resolução de problemas, comunicação, priorização, colaboração);
  a nota geral é a média dessas 6, calculada no back-end
- Deploy: Render
- Documentação completa em [`backend.md`](./backend.md)

**Autenticação:** implementada via `POST /login` (compara `senha_hash` com
bcrypt) e `PATCH /usuarios/{id}/tutorial-visto` (marca `primeiro_login` como
`false` ao concluir o tutorial). A tela de `Login` do front-end já consulta
essa API. Cadastro (`POST /cadastro` ou similar) ainda não tem endpoint —
ver [`backend.md`](./backend.md#7-o-que-ainda-falta).

## 3. Modelo de Domínio

O modelo de domínio foi mapeado em um diagrama de classes UML (disponível em
`/docs/diagrama.png`). As principais entidades são:

### `Usuario`
Representa a pessoa candidata que usa a plataforma.

| Atributo | Tipo |
|---|---|
| id | UUID |
| nomeCompleto | String |
| email | String |
| senha | String |
| nivelExpertise | NivelExpertise (enum) |
| xp | int |
| nivelDificuldade | NivelDificuldade (enum) |
| statusLogin | boolean |
| primeiroLogin | boolean |

**Métodos:** `entrar()`, `criarConta()`, `recuperarSenha()`, `loginComGoogle()`,
`loginComApple()`, `loginComLinkedin()`, `ganharXp()`

Suporta login social (Google, Apple, LinkedIn) além do fluxo tradicional de
cadastro/recuperação de senha. O XP acumulado influencia o nível de expertise
e, consequentemente, a dificuldade dos cases oferecidos.

### `Tutorial`
Exibido automaticamente no primeiro login do usuário, apresentando as regras
da simulação.

| Atributo | Tipo |
|---|---|
| etapas | List\<String\> |
| usuarioId | UUID |
| exibido | boolean |

**Métodos:** `exibirTutorial()`, `explicarNiveis()`, `explicarConfidencialidade()`,
`explicarLGPD()`

### `Lobby` (sala de case)
Onde os participantes se reúnem antes do início do case.

| Atributo | Tipo |
|---|---|
| nivelExpertise | NivelExpertise (enum) |
| nivelDificuldade | NivelDificuldade (enum) |
| numeroParticipantes | int |
| participantes | List\<Usuario\> |

**Métodos:** `iniciarCase()`, `visualizarResultados()`, `exibirCase()`,
`definirDificuldadePorXp()`

A dificuldade do case é definida automaticamente com base no XP acumulado
pelos participantes (`definirDificuldadePorXp()`).

### `Case`
O desafio propriamente dito, cronometrado.

| Atributo | Tipo |
|---|---|
| id | UUID |
| titulo | String |
| descricao | String |
| nivelDificuldade | NivelDificuldade (enum) |
| tempoMinimoBusca | Time |
| temporizadorAberto | Time |

**Métodos:** `iniciarTemporizador()`, `exibirCaseTelaCheia()`, `abrirChat()`

### `Resultado`
Gerado ao final da simulação, com feedback de desempenho apoiado por IA.

| Atributo | Tipo |
|---|---|
| id | UUID |
| nivelAlcancado | decimal (0.0–10.0) — média das 6 notas por categoria abaixo |
| aprovado | boolean — `true` se nivelAlcancado > 7; concede XP ao usuário |
| notaRaciocinioLogico | decimal (0.0–10.0) |
| notaQualidadeTecnica | decimal (0.0–10.0) |
| notaResolucaoProblemas | decimal (0.0–10.0) |
| notaComunicacao | decimal (0.0–10.0) |
| notaPriorizacao | decimal (0.0–10.0) |
| notaColaboracao | decimal (0.0–10.0) |
| feedbackSimulado | String |

**Métodos:** `calcularRespostas()`, `gerarFeedback()`, `exibirAnimacaoNivel()`

> `nivelAlcancado` era um inteiro na escala 0-100 nas primeiras versões do
> back-end; foi alterado para decimal (0-10) quando o critério de aprovação
> passou a ser a média das 6 notas por categoria. Detalhes da implementação
> em [`backend.md`](./backend.md#5-endpoints).

### Enumerações

**`NivelExpertise`**: `ESTAGIARIO`, `JUNIOR`
**`NivelDificuldade`**: `FACIL`, `MEDIO`, `DIFICIL`

### Relacionamentos principais

- `Usuario` **possui** `Tutorial` (visualizado no primeiro login)
- `Usuario` **participa** de `Lobby`
- `Usuario` **é classificado como** `NivelExpertise`
- `Lobby` **contém** `Case`
- `Case` **é configurado com** `NivelDificuldade`
- `Case` **gera** `Resultado`
- `Usuario` **possui** `Resultado`

> ⚠️ Os nomes das classes acima (`Lobby`, `Case`, `Resultado`, `Tutorial`) foram
> inferidos a partir do diagrama em `/docs/diagrama.png`. Vale a pena a equipe
> conferir rapidamente se batem com os nomes reais usados no diagrama antes da
> entrega final.

## 4. Diagrama de Classes

O diagrama completo está disponível em [`/docs/diagrama.png`](./diagrama.png).

Versão em Mermaid (útil para versionamento e leitura direto no GitHub):

```mermaid
classDiagram
  class Usuario {
    id: UUID
    nomeCompleto: String
    email: String
    senha: String
    nivelExpertise: NivelExpertise
    xp: int
    nivelDificuldade: NivelDificuldade
    statusLogin: boolean
    primeiroLogin: boolean
    entrar()
    criarConta()
    recuperarSenha()
    loginComGoogle()
    loginComApple()
    loginComLinkedin()
    ganharXp()
  }

  class Lobby {
    usuarioId: UUID
    historicoResultados: List~Resultado~
    usuarioAtual: Usuario
    iniciarCase()
    visualizarResultados()
  }

  class Tutorial {
    etapas: List~String~
    exibido: boolean
    exibirTutorial()
    explicarNiveis()
    explicarConfidencialidade()    
    explicarLGPD()    
  }

  class Sala {
    id: UUID
    nivelExpertise: NivelExpertise
    nivelDificuldade: NivelDificuldade
    numeroParticipantes: int
    participantes: List~Usuario~
    exibirCase()
    definirDificuldadePorXp()
  }

  class Case {
    id: UUID
    titulo: String
    descricao: String
    nivelDificuldade: NivelDificuldade
    tempoMinimoBusca: Time
    temporizadorAberto: Time
    iniciarTemporizador()
    exibirCaseTelaCheia()
    abrirChat()
  }

  class Chat {
    mensagens: List~String~
    enviarMensagem()
  }

  class Resultado {
    id: UUID
    nivelAlcancado: decimal
    aprovado: boolean
    notaRaciocinioLogico: decimal
    notaQualidadeTecnica: decimal
    notaResolucaoProblemas: decimal
    notaComunicacao: decimal
    notaPriorizacao: decimal
    notaColaboracao: decimal
    feedbackSimulado: String
    calcularRespostas()
    gerarFeedback()
    exibirAnimacaoNivel()
  }

  class NivelExpertise {
    <<enumeration>>
    ESTAGIARIO
    JUNIOR
  }

  class NivelDificuldade {
    <<enumeration>>
    FACIL
    MEDIO
    DIFICIL
  }

  Usuario "1" -- "1" Lobby : possui
  Usuario "1" -- "0..1" Tutorial : visualiza no primeiro login
  Usuario "1" -- "0..*" Sala : participa
  Usuario "1" -- "1" NivelExpertise : classificado como
  Lobby "1" -- "0..*" Resultado : histórico
  Sala "1" *-- "1" Case : contém
  Sala "1" -- "1" NivelDificuldade : configurada com
  Case "1" *-- "1" Chat : possui
  Case "1" -- "0..1" Resultado : gera
```

## 5. Fluxo da Aplicação

1. **Cadastro/Login** — usuário cria conta ou entra via e-mail/senha ou login
   social.
2. **Tutorial** — exibido apenas no primeiro login, explica níveis, confidencialidade
   e conformidade com a LGPD.
3. **Lobby** — usuário entra em uma sala; a dificuldade do case é definida
   automaticamente pelo XP acumulado.
4. **Case** — desafio cronometrado, com chat entre participantes.
5. **Resultado** — cálculo de desempenho e geração de feedback simulado via IA,
   com animação de progressão de nível.

## 6. Decisões Técnicas

- **Vite + React**: escolhido pela velocidade de setup e HMR, adequado ao prazo
  curto do hackathon.
- **Gamificação por XP**: a progressão de dificuldade dos cases é automática,
  reduzindo fricção e mantendo o desafio alinhado ao nível real do candidato.
- **Dados fictícios**: em conformidade com o edital do hackathon (seção 8),
  todos os dados de teste utilizados na aplicação são mockados, sem captura de
  dados pessoais reais de terceiros.
- **FastAPI + Supabase**: escolhidos pela curva de aprendizado rápida e pela
  necessidade de banco gerenciado sem custo de infraestrutura extra durante o
  hackathon.
- **Groq para avaliação por IA**: escolhida por hospedar modelos open-source
  (Llama 3.3) com inferência rápida o bastante para responder dentro de uma
  requisição HTTP síncrona, e por ter um free tier viável para o volume de um
  hackathon — evitando custo com APIs pagas (OpenAI, Anthropic, etc.).
- **Avaliação em 6 categorias, com nota geral calculada no back-end**: pedir a
  nota geral separadamente à IA arriscaria inconsistência com as notas
  individuais (a IA "errar a conta"). Calculá-la como a média das 6 categorias
  no próprio back-end garante que a nota geral seja sempre coerente com o
  detalhamento mostrado ao usuário.
- **Fallback quando a IA está indisponível**: se a Groq falhar (timeout, erro
  HTTP, resposta malformada), a solução é aprovada por padrão em vez de
  travar o fluxo do participante — prioriza a experiência do usuário em
  detrimento da precisão da avaliação nesse cenário raro.
- **B06 não persiste dados**: o endpoint que recebe a solução (`/solucao`)
  apenas valida se as referências existem; toda a escrita em `resultados`
  acontece em `/avaliacao`, evitando dois pontos gravando o mesmo dado.

Mais detalhes de implementação do back-end em [`backend.md`](./backend.md).
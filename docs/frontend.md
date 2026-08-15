# Documentação do Front-end — theCoders Cases

> Para o modelo de domínio e a visão geral da arquitetura, veja [`arquitetura.md`](./arquitetura.md).
> Este documento cobre como o domínio foi implementado na interface: stack, rotas, páginas e componentes.

## 1. Stack

| Categoria | Tecnologia | Versão |
|---|---|---|
| Biblioteca de UI | React | ^19.2.7 |
| Build/Dev server | Vite | ^8.1.1 |
| Roteamento | react-router-dom | ^7.18.2 |
| Ícones | lucide-react, react-icons | ^1.28.0 / ^5.7.0 |
| Tempo real | socket.io-client | ^4.8.3 |
| Lint | ESLint | ^10.6.0 |

Comunicação com o back-end via `fetch` nativo (não Axios — o README principal
menciona Axios, mas o projeto usa `fetch` mesmo; vale corrigir o README).
A URL base da API fica centralizada em `src/config/api.js`.

## 2. Como rodar localmente

```bash
cd thecoders-cases
npm i
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

## 3. Estrutura de pastas

```
thecoders-cases/src/
├── assets/            # logos, ícones e ilustrações estáticas
├── components/        # componentes reutilizáveis entre páginas
├── config/
│   └── api.js         # API_BASE_URL — URL base do back-end, hoje hardcoded
├── pages/              # uma pasta por tela, cada uma com index.jsx + index.css
├── utils/
│   └── nivel.js        # normaliza/formata nivel_expertise (ESTAGIARIO/JUNIOR/SENIOR)
├── App.jsx            # componente raiz, apenas renderiza o Router
├── main.jsx            # entrypoint (ReactDOM.createRoot)
└── router.jsx          # definição de todas as rotas (react-router-dom)
```

Cada página e cada componente segue o padrão **co-location**: o `.jsx` e o
`.css` ficam juntos na mesma pasta, o que facilita achar e manter o estilo de
cada peça isoladamente.

## 4. Rotas

| Rota | Página | Descrição |
|---|---|---|
| `/` | `Login` | Autenticação (e-mail/senha ou social: Google, Apple, LinkedIn) |
| `/cadastro` | `CadastroPage` | Criação de conta, com validação de e-mail/senha duplicados |
| `/recuperar` | `EsqueciSenha` | Solicitação de link de recuperação de senha |
| `/tutorial` | `Tutorial` | Onboarding em carrossel (5 slides), exibido no primeiro login |
| `/lobby` | `Lobby` | Tela principal: perfil, XP e card do próximo case |
| `/on-case` | `OnCase` | Tela do case em andamento (cronômetro, descrição, chat, envio de solução) |
| `/processing-solution` | `ProcessingSolution` | Tela de espera enquanto a IA "avalia" a solução enviada |
| `/last-result` | `LastResult` | Resultado da avaliação (notas por competência + resumo) |

Isso reflete diretamente o fluxo descrito em `arquitetura.md`:
**Login/Cadastro → Tutorial → Lobby → Case → Processamento → Resultado.**

## 5. Páginas

### `Login` (`/`)
Formulário de e-mail/senha, com toggle de visibilidade da senha, mais três
botões de login social (Google, Apple, LinkedIn — atualmente só logam no
console). Links para `/recuperar` e `/cadastro`.

Já integrado com o back-end: no submit, chama `POST /login` (via
`API_BASE_URL`, ver seção 1). Se `primeiro_login` vier `true` na resposta,
navega para `/tutorial`; senão, para `/lobby` — em ambos os casos passando
`usuarioId` e `usuarioNome` via `state` de navegação do React Router. Erro de
autenticação (401) exibe mensagem inline; falha de conexão com o servidor
também é tratada com mensagem própria.

### `CadastroPage` (`/cadastro`)
Formulário de cadastro com campos: nome, nome social (opcional, com texto de
apoio inclusivo), CPF (desabilitado se "Sou estrangeiro" marcado), e-mail +
confirmação, senha + confirmação. Valida no `submit` se e-mail e senha
coincidem com suas respectivas confirmações, exibindo erro inline por campo.

### `EsqueciSenha` (`/recuperar`)
Formulário simples de e-mail para envio de link de recuperação (mock via
`alert`).

### `Tutorial` (`/tutorial`)
Carrossel de 5 slides explicando o funcionamento da plataforma (boas-vindas,
como funciona o case, avaliação/confidencialidade, evolução de nível). Setas
de navegação ficam desabilitadas nas pontas; barra de progresso com bolinhas
indica o slide atual; botão "Finalizar Tutorial" aparece só no último slide.

Já integrado com o back-end: ao finalizar, chama
`PATCH /usuarios/{usuarioId}/tutorial-visto` (usando o `usuarioId` recebido
via `state` da navegação vinda do `Login`) para marcar
`primeiro_login` como `false`, e só então navega para `/lobby`. Se a chamada
falhar, o erro é só logado no console — a navegação para `/lobby` acontece de
qualquer forma (evita travar o usuário por causa de uma falha de rede nessa
etapa não-crítica).

### `Lobby` (`/lobby`)
Tela principal pós-login: `Navbar` + `CardProfile` (nível, XP, próximo nível)
+ `CardCases` (cases concluídos, dificuldade atual, atalho para o último
resultado e para iniciar um novo case).

Já integrado: assim que monta, chama `GET /usuarios/{usuarioId}/perfil` e
atualiza nome/nível/XP com o dado real (antes disso, usa como fallback o que
veio via `state` de navegação — nome e nível "ESTAGIARIO"). `nivel_expertise`
bruto (`"ESTAGIARIO"`, `"JUNIOR"`, `"SENIOR"`) é normalizado com
`padronizarNivel`/`NIVEL_LABEL`/`NIVEL_ABREVIACAO` de `utils/nivel.js` antes
de virar texto em português ou a letra exibida na `Navbar`.

### `OnCase` (`/on-case`)
Tela do case em si — a mais complexa do front-end.

- **Carregamento do case**: se veio um `caseId` via `state` (ex.: vindo de um
  evento de socket), busca `GET /cases/{caseId}`; senão, busca o perfil do
  usuário e chama `GET /cases/aleatorio` com o nível dele. Se o back-end
  estiver fora do ar, cai no fallback `GET /cases` e pega o primeiro da lista.
- **Criação de sala**: assim que o case carrega, chama `POST /salas` para
  obter um `salaId` — necessário porque `/avaliacao` exige `sala_id`. É o fix
  rápido "1 usuário = 1 sala" (ver [`backend.md`](./backend.md)).
- **Tela cheia**: entra automaticamente (com fallback no primeiro clique/tecla
  se o navegador bloquear) e sai ao desmontar.
- **Anti-cheat via Socket.IO**: escuta `fullscreenchange` e `visibilitychange`;
  se o usuário sai da tela cheia ou troca de aba, emite
  `case:infracao_detectada` no socket e bloqueia localmente o envio do
  arquivo (`envioBloqueado`, repassado para `CaseDescription`). Também escuta
  `case:redirecionar_lobby` (redireciona todo mundo pro lobby) e
  `case:nova_case` (troca o case em andamento). **Nenhum desses três eventos
  tem um servidor do outro lado hoje** — ver o alerta na seção 1.
- **Envio da solução**: `CaseDescription` chama `onSubmitSolution`, que
  navega para `/processing-solution` levando `usuarioId`, `caseId`, `salaId`
  e o texto da solução via `state`.

Renderiza `CaseDescription` (enunciado + cronômetro + campo de envio) e
`ChatBox` lado a lado.

### `ProcessingSolution` (`/processing-solution`)
Tela de transição com checklist de "etapas de avaliação da IA" (o checklist
em si é estático/decorativo) e contagem regressiva visual de 5 segundos.

Já integrado: dispara `POST /avaliacao` em paralelo à contagem, com
`usuario_id`, `case_id`, `sala_id` e `solucao_enviada` recebidos via `state`.
A navegação só acontece quando **as duas coisas terminam** — a animação
mínima de 5s (por UX) e a resposta real da API — o que vier depois "segura"
o outro via refs (`animacaoConcluidaRef`, `avaliacaoRef`). Se a avaliação
falhar (erro de rede, HTTP, ou dados ausentes no `state`), redireciona para
`/lobby` com um aviso; se der certo, vai para `/last-result` levando o
`resultado` completo da API via `state`.

### `LastResult` (`/last-result`)
Exibe o resultado do último case: `Score` (notas por competência) e `Resume`
(feedback textual em HTML, renderizado via `dangerouslySetInnerHTML`).

Já integrado: usa o `resultado` recebido via `state` (vindo de
`ProcessingSolution`) — só considera válido se `status === "avaliado"` e tem
`notas_categorias`; caso contrário (acesso direto à página, por exemplo),
mostra notas zeradas e uma mensagem convidando a resolver um case. O nível
exibido na `Navbar` é buscado à parte via `GET /usuarios/{usuarioId}/perfil`.

## 6. Componentes

| Componente | Usado em | Função |
|---|---|---|
| `Navbar` | Lobby, LastResult | Cabeçalho com logo, atalho para `/tutorial`, nível do usuário (`Nivel`) e ícone de perfil (`ProfileIcon`) |
| `Nivel` | Navbar | Badge com a letra do nível atual (ex: "E" de Estagiário) |
| `ProfileIcon` | Navbar | Botão de acesso ao perfil (ícone SVG inline) |
| `CardProfile` | Lobby | Card com nível atual, barra de progresso de XP e próximo nível |
| `CardCases` | Lobby | Card com cases concluídos, dificuldade e atalhos para iniciar/ver resultado |
| `Buttons` | CardCases, LastResult | Botão genérico com variantes `primary`/`white`, navega via `page` prop |
| `CaseDescription` | OnCase | Título, dificuldade, `Timer` circular e descrição do case; dispara `onSubmitSolution` no envio e mostra aviso quando `envioBloqueado` (usuário saiu da tela cheia) |
| `ChatBox` | OnCase | Chat lateral da sala, mantém mensagens em estado local; recebe `user` (nome de quem está logado) |
| `SendMsgBar` | CaseDescription, ChatBox | Input + botão de envio reutilizável; pode navegar para outra rota ao submeter (`navigateOnSubmit`), apenas disparar um callback (`onSubmit`), ou ficar desabilitado (`disabled`) |
| `Timer` | CaseDescription | Cronômetro circular (SVG) com contagem regressiva e barra de progresso animada |
| `Score` | LastResult | Tabela de notas por competência (raciocínio lógico, qualidade técnica, etc.) |
| `Resume` | LastResult | Bloco de feedback textual (HTML) |

## 7. Integração com o back-end

Ver a tabela completa em [`backend.md`](./backend.md#8-integração-com-o-front-end-estado-atual).
Resumo: **o fluxo principal (login → tutorial → lobby → case → avaliação →
resultado) já está de ponta a ponta com a API real.** O que ainda falta:

- **Cadastro e recuperação de senha** (`CadastroPage`, `EsqueciSenha`): telas
  prontas, mas sem nenhuma chamada de API — `CadastroPage` só valida
  coincidência de e-mail/senha; não há validação de formato de CPF, força de
  senha ou feedback de erro do back-end (que também não tem os endpoints
  ainda).
- **Login social**: os botões de Google/Apple/LinkedIn ainda não disparam
  nenhum fluxo de OAuth real.
- **URL da API hardcoded**: `src/config/api.js` tem
  `API_BASE_URL = "http://127.0.0.1:8000"` fixo. Antes do deploy, trocar para
  uma variável de ambiente (`VITE_API_URL` via `import.meta.env`) que aponte
  para a URL do Render em produção.
- **`usuarioId` só existe em memória**: passado via `state` de navegação do
  React Router, tela a tela. Um refresh de página perde essa informação, já
  que não há token/sessão persistida (ver
  [`backend.md`](./backend.md#7-o-que-ainda-falta)).
- **Servidor Socket.IO ausente**: ver o alerta na seção 1 — a camada de
  tempo real do `OnCase` (anti-cheat, sincronização de sala) não tem back-end
  nenhum implementado ainda.
- **`num` de cases concluídos fixo em `0`** no `Lobby` — falta um endpoint de
  contagem.

## 8. Rastreabilidade com o edital

Este documento, junto com `arquitetura.md`, atende ao requisito do edital
(seção 4) de que o `README`/documentação do repositório explique claramente
a aplicação e sirva de base para a avaliação de **Arquitetura de Código e
Qualidade Técnica** (critério de até 25 pontos).
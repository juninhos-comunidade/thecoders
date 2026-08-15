# Documentação do Back-end — theCoders Cases

> Para o modelo de domínio e a visão geral da arquitetura, veja [`arquitetura.md`](./arquitetura.md).
> Este documento cobre como o domínio foi implementado na API: stack, estrutura, banco de dados e endpoints.

## 1. Stack

| Categoria | Tecnologia |
|---|---|
| Framework web | FastAPI |
| Linguagem | Python 3 |
| Banco de dados | Supabase (Postgres gerenciado), acessado via `supabase-py` |
| Avaliação por IA | Groq API (`llama-3.3-70b-versatile`), chamada via `httpx` |
| Autenticação | `bcrypt` (hash/verificação de senha), `email-validator` (validação de e-mail no Pydantic) |
| Validação de dados | Pydantic |
| Servidor ASGI | Uvicorn |
| Deploy | Render |

CORS habilitado via `CORSMiddleware` em `main.py`, liberado hoje para
`http://localhost:5173` (origem do front-end em desenvolvimento).

## 2. Como rodar localmente

```bash
cd thecoders-cases-back
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows (PowerShell)
source .venv/bin/activate       # Linux/macOS
pip install -r requirements.txt
```

Crie um arquivo `.env` na raiz de `thecoders-cases-back` com:

```env
SUPABASE_URL=https://soquaptpgdmltauxjmcu.supabase.co
SUPABASE_KEY=sua_chave_do_supabase
GROQ_API_KEY=sua_chave_da_groq
```

Depois, na raiz do projeto (`thecoders-cases-back`, **não** dentro de `.venv`):

```bash
uvicorn main:app --reload
```

API disponível em `http://127.0.0.1:8000`, com documentação interativa (Swagger) em `http://127.0.0.1:8000/docs`.

## 3. Estrutura de pastas

```
thecoders-cases-back/
├── main.py                    # instancia o FastAPI e inclui os routers
├── database/
│   └── supabase_client.py     # cria o client do Supabase a partir de variáveis de ambiente
├── models/                    # schemas Pydantic de entrada (request bodies)
│   ├── solucao.py
│   ├── avaliacao.py
│   └── login.py
├── routers/                   # endpoints da API, um arquivo por recurso
│   ├── solucao.py
│   ├── avaliacao.py
│   ├── login.py
│   └── usuario.py
├── services/                  # lógica de negócio desacoplada dos endpoints
│   └── avaliacao_ia.py        # integração com a Groq API
├── supabase/
│   ├── config.toml
│   └── migrations/            # histórico de alterações no schema do banco
└── requirements.txt
```

## 4. Banco de dados

Schema gerenciado via migrações SQL na pasta `supabase/migrations/`, aplicadas com a Supabase CLI (`supabase db push`).

### Tabelas

**`usuarios`**

| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | PK |
| nome_completo | text | |
| email | text | único |
| senha_hash | text |  |
| nivel_expertise | enum (`ESTAGIARIO`, `JUNIOR`) | |
| xp | integer | default 0, incrementado pelo endpoint `/avaliacao` |
| nivel_dificuldade | enum (`FACIL`, `MEDIO`, `DIFICIL`) | |
| status_login | boolean | |
| primeiro_login | boolean | |

**`cases`**

| Coluna | Tipo |
|---|---|
| id | uuid (PK) |
| titulo | text |
| descricao | text |
| nivel_dificuldade | enum |
| tempo_minimo_busca | interval |
| temporizador_aberto | interval |

**`salas`** — referencia `cases`, representa uma rodada vinculada a um case.

**`sala_participantes`** — tabela de associação `salas` ↔ `usuarios`.

**`chat_mensagens`** — mensagens do chat de uma sala, referencia `salas` e `usuarios`.

**`resultados`** — registrado pelo endpoint `POST /avaliacao` a cada solução avaliada.

| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid | PK |
| usuario_id, case_id, sala_id | uuid | referências |
| solucao_enviada | text | |
| nivel_alcancado | numeric(3,1) | nota geral = **média das 6 categorias abaixo**, escala 0.0–10.0 |
| aprovado | boolean | `true` se `nivel_alcancado > 7` |
| feedback_simulado | text | feedback textual gerado pela IA (nota geral + pontos fortes + pontos a melhorar) |
| nota_raciocinio_logico | numeric(3,1) | |
| nota_qualidade_tecnica | numeric(3,1) | |
| nota_resolucao_problemas | numeric(3,1) | |
| nota_comunicacao | numeric(3,1) | |
| nota_priorizacao | numeric(3,1) | |
| nota_colaboracao | numeric(3,1) | |

## 5. Endpoints

### `GET /health`
Verifica se a API está no ar e se a conexão com o Supabase está funcionando.

### `POST /login`
Autentica um usuário por e-mail e senha, comparando com `senha_hash` via bcrypt.

**Request body:**
```json
{ "email": "usuario@exemplo.com", "senha": "senha_em_texto_puro" }
```

**Response `200`:**
```json
{
  "id": "uuid",
  "nome_completo": "Nome do usuário",
  "email": "usuario@exemplo.com",
  "primeiro_login": true,
  "nivel_expertise": "ESTAGIARIO",
  "xp": 0
}
```

**Response `401`** — e-mail não encontrado ou senha incorreta (mesma mensagem genérica para os dois casos, por segurança).

> `primeiro_login: true` é o sinal que o front-end usa para decidir se redireciona para `/tutorial` ou direto para `/lobby`.

### `PATCH /usuarios/{usuario_id}/tutorial-visto`
Marca `primeiro_login` como `false`, chamado pelo front-end ao concluir o carrossel do Tutorial.

**Response `200`:**
```json
{ "id": "uuid", "primeiro_login": false }
```

**Response `404`** — usuário não encontrado.

### `GET /usuarios/{usuario_id}/perfil`
Retorna os dados de perfil usados pelo `Lobby` e pela `Navbar` no front-end
(nome, nível, XP, se já viu o tutorial).

**Response `200`:**
```json
{
  "id": "uuid",
  "nome_completo": "Nome do usuário",
  "nivel_expertise": "ESTAGIARIO",
  "xp": 40,
  "primeiro_login": false
}
```

**Response `404`** — usuário não encontrado.

### `GET /cases`
Lista todos os cases cadastrados (usado como fallback em `OnCase` quando não
dá pra determinar o perfil do usuário).

**Response `200`:**
```json
{ "cases": [ { "id": "uuid", "titulo": "...", "descricao": "...", "nivel_dificuldade": "FACIL", "tempo_minimo_busca": 18 } ] }
```

### `GET /cases/aleatorio?usuario_id=...&nivel_usuario=...`
Sorteia um case entre os que são compatíveis com o nível do usuário
(`ESTAGIARIO` → `FACIL`; `JUNIOR` → `FACIL`/`MEDIO`; `SENIOR` → `MEDIO`/`DIFICIL`).
Se `usuario_id` for informado, o nível é buscado no banco (sobrescreve
`nivel_usuario`). Se nenhum case bater com o nível, cai para qualquer case
disponível como fallback.

**Response `200`:** um case único, no mesmo formato de `GET /cases/{case_id}`.

**Response `404`** — nenhum case cadastrado no banco.

### `GET /cases/{case_id}`
Busca um case específico por id.

**Response `200`:**
```json
{ "id": "uuid", "titulo": "...", "descricao": "...", "nivel_dificuldade": "FACIL", "tempo_minimo_busca": 18 }
```

**Response `404`** — case não encontrado.

### `POST /salas`
Cria uma sala vinculada a um case, chamada pelo front-end assim que o `OnCase`
carrega o case do usuário. Ver o alerta na seção 4 sobre o schema atual de
`salas` e a limitação de "1 usuário = 1 sala" (fix rápido enquanto não há
multiplayer real).

**Request body:**
```json
{ "case_id": "uuid", "usuario_id": "uuid" }
```

**Response `200`:**
```json
{ "id": "uuid" }
```

**Response `404`** — case ou usuário não encontrado.

### `POST /solucao` (B06)
Valida se uma solução pode ser enviada, checando se `usuario_id`, `case_id` e `sala_id` existem no banco.

**Não persiste nada** — essa é uma decisão de design intencional: toda a escrita em `resultados` acontece em `/avaliacao` (B09), para não haver dois pontos gravando o mesmo dado.

**Request body:**
```json
{
  "usuario_id": "uuid",
  "case_id": "uuid",
  "sala_id": "uuid",
  "solucao_enviada": "texto da solução"
}
```

**Response `200`:**
```json
{
  "status": "validado",
  "usuario_id": "uuid",
  "case_id": "uuid",
  "sala_id": "uuid",
  "solucao_enviada": "texto da solução"
}
```

**Response `404`** — se usuário, case ou sala não existirem.

### `POST /avaliacao` (B09)
Avalia a solução com IA (Groq), persiste o resultado e concede XP se aprovado.

**Request body:** igual ao de `/solucao` (`solucao_enviada` é opcional aqui — ver fluxo de não-envio abaixo).

**Fluxo:**
1. Se `solucao_enviada` vier vazio/nulo → retorna imediatamente `status: "nao_enviado"`, sem chamar a IA nem gravar no banco.
2. Busca `usuarios` (para `xp` e `nivel_expertise`) e `cases` (para `titulo`/`descricao`, usados no prompt). Retorna `404` se algum não existir.
3. Chama a Groq API pedindo nota de 0.0 a 10.0 em 6 categorias: `raciocinio_logico`, `qualidade_tecnica`, `resolucao_problemas`, `comunicacao`, `priorizacao`, `colaboracao`.
4. Calcula `nota_media` como a **média aritmética das 6 categorias** (calculada em Python, não pedida à IA — garante consistência entre a nota geral e as notas individuais).
5. `aprovado = nota_media > 7`.
6. Se `aprovado`, soma `10` de XP ao usuário (`usuarios.xp`).
7. Grava tudo em `resultados` (nota geral, aprovado, feedback, as 6 notas por categoria).

**Response `200` (avaliado):**
```json
{
  "status": "avaliado",
  "aprovado": true,
  "nota_media": 8.1,
  "feedback": "texto com nota geral, pontos fortes e pontos a melhorar",
  "notas_categorias": {
    "raciocinioLogico": "8,5",
    "qualidadeTecnica": "8,0",
    "resolucaoProblemas": "8,0",
    "comunicacao": "8,5",
    "priorizacao": "7,5",
    "colaboracao": "8,0"
  },
  "xp_ganho": 10,
  "xp_total": 40
}
```

**Response `200` (não enviado):**
```json
{ "status": "nao_enviado", "aprovado": false, "redirecionar": "lobby" }
```

**Fallback (Groq indisponível):** se a chamada à Groq falhar (timeout, erro HTTP, JSON malformado ou nota fora do range 0–10 em qualquer categoria), a solução é **aprovada por padrão** — `aprovado: true`, `nota_media: null`, `notas_categorias` com todos os valores `null`, e um feedback textual avisando que a avaliação não pôde ser concluída. Essa decisão evita que uma instabilidade externa (a Groq) trave o fluxo de XP do participante.

## 6. Integração com a Groq (avaliação por IA)

Implementada em `services/avaliacao_ia.py`. Resumo do funcionamento:

- Monta um prompt com o título e a descrição do case, o `nivel_expertise` do candidato, e o texto da solução enviada.
- Pede à Groq uma resposta em JSON estruturado (`response_format: json_object`) contendo `pontos_fortes`, `pontos_melhoria`, `feedback_geral` e `notas_categorias` (as 6 notas, 0.0–10.0).
- Valida a resposta: cada categoria precisa ser um número entre 0 e 10; qualquer falha de formato levanta `AvaliacaoIAIndisponivel`, capturada pelo router para acionar o fallback.
- `nota_media` **não é pedida à IA** — é calculada em Python como a média das 6 categorias, evitando divergência entre a nota geral e as notas individuais.

## 7. O que ainda falta

- **Cadastro**: existe `POST /login`, mas nenhum endpoint para criar um novo usuário (`senha_hash` precisa ser gerado no back-end, nunca recebido em texto puro do front). A tela de `CadastroPage` do front-end ainda não chama nenhuma API.
- **Recuperação de senha**: sem endpoint; a tela `EsqueciSenha` do front-end é só um mock via `alert`.
- **Seed data**: popular `usuarios`, `cases` e `salas` com dados mockados para demonstração (dados fictícios, conforme exigido pelo edital).
- **Servidor Socket.IO não existe no back-end**: o front-end (`OnCase`) conecta em `io("http://localhost:3000")` esperando eventos `case:infracao_detectada`, `case:redirecionar_lobby` e `case:nova_case`, mas não há nenhum servidor Socket.IO neste repositório — nem em Python (`python-socketio` não está em `requirements.txt`), nem um serviço Node separado. Hoje isso significa que a detecção de "saiu da tela cheia" só ocorre no front (bloqueia o envio localmente) mas nunca é sincronizada entre participantes de fato. Precisa decidir: implementar um servidor Socket.IO (Python ou Node) e colocá-lo no repo/deploy, ou trocar essa camada por outra estratégia (Supabase Realtime, polling REST). Ver também [`frontend.md`](./frontend.md#7-integração-com-o-back-end).
- **Sessão/token**: o login hoje devolve os dados do usuário na resposta, mas não gera nenhum token (JWT ou similar); o front-end guarda o `usuario_id` via `state` de navegação do React Router, que se perde num refresh de página.
- **Migration de `salas` desatualizada**: ver alerta na seção 4 — o schema real (alterado direto no Supabase) não bate mais com `supabase/migrations/`.

## 8. Integração com o front-end (estado atual)

| Tela do front | Endpoint(s) consumidos |
|---|---|
| `Login` | `POST /login` |
| `Tutorial` | `PATCH /usuarios/{id}/tutorial-visto` |
| `Lobby` | `GET /usuarios/{id}/perfil` |
| `OnCase` | `GET /cases/{id}` ou `GET /cases/aleatorio`, `POST /salas` |
| `ProcessingSolution` | `POST /avaliacao` |
| `LastResult` | `GET /usuarios/{id}/perfil` |
| `CadastroPage`, `EsqueciSenha` | nenhum — ainda mockados |

Ou seja: **todo o fluxo principal (login → tutorial → lobby → case → avaliação → resultado) já está de ponta a ponta conectado à API real.** O que falta é cadastro, recuperação de senha, sessão/token e a camada de tempo real (item acima).
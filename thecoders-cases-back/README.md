# theCoders Cases — Backend

API do **theCoders Cases**, um simulador de cases em grupo para candidatos
iniciantes em TI (Estagiário/Júnior), com avaliação de desempenho apoiada por
IA. Para a visão geral do produto, veja o [README da raiz do projeto](../README.md).

> Documentação técnica completa (banco de dados, endpoints, integração com
> IA) em [`docs/backend.md`](../docs/backend.md).

## Stack

- **FastAPI** (Python 3) — framework web
- **Supabase** (Postgres gerenciado) — banco de dados, acessado via `supabase-py`
- **Groq API** (`llama-3.3-70b-versatile`) — avaliação de soluções por IA, via `httpx`
- **bcrypt** — hash e verificação de senha
- **Pydantic** — validação de dados de entrada
- **Uvicorn** — servidor ASGI
- Deploy: **Render**

## Estrutura de pastas

```
thecoders-cases-back/
├── main.py                 # instancia o FastAPI, CORS e inclui os routers
├── database/
│   └── supabase_client.py  # client do Supabase (lê SUPABASE_URL/SUPABASE_KEY do .env)
├── models/                 # schemas Pydantic dos request bodies
├── routers/                # endpoints da API
├── services/
│   └── avaliacao_ia.py     # integração com a Groq API
├── supabase/
│   ├── config.toml
│   └── migrations/         # histórico de mudanças no schema do banco
└── requirements.txt
```

## Como rodar localmente

Pré-requisitos: Python 3.11+, uma conta no [Supabase](https://supabase.com)
com o projeto do time, e uma chave da [Groq](https://console.groq.com/keys)
(gratuita, sem cartão de crédito).

```bash
cd thecoders-cases-back

# criar e ativar o ambiente virtual
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows (PowerShell)
# source .venv/bin/activate     # Linux/macOS

# instalar dependências
pip install -r requirements.txt
```

Crie um arquivo `.env` na raiz de `thecoders-cases-back`:

```env
SUPABASE_URL=https://soquaptpgdmltauxjmcu.supabase.co
SUPABASE_KEY=sua_chave_do_supabase
GROQ_API_KEY=sua_chave_da_groq
```

Rode o servidor (a partir da raiz de `thecoders-cases-back`, **não** de
dentro de `.venv`):

```bash
uvicorn main:app --reload
```

API em `http://127.0.0.1:8000`, documentação interativa (Swagger) em
`http://127.0.0.1:8000/docs`.

## Banco de dados

Schema versionado em `supabase/migrations/`, aplicado com a Supabase CLI:

```bash
supabase link --project-ref soquaptpgdmltauxjmcu   # uma vez por máquina
supabase db push
```

Tabelas principais: `usuarios`, `cases`, `salas`, `sala_participantes`,
`chat_mensagens`, `resultados`. Detalhamento completo de cada coluna em
[`docs/backend.md`](../docs/backend.md#4-banco-de-dados).

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API e a conexão com o Supabase estão funcionando |
| POST | `/login` | Autentica por e-mail/senha (bcrypt) |
| PATCH | `/usuarios/{id}/tutorial-visto` | Marca o tutorial como visto (`primeiro_login = false`) |
| POST | `/solucao` | Valida se uma solução pode ser enviada (não persiste) |
| POST | `/avaliacao` | Avalia a solução com IA, persiste o resultado e concede XP |

Request/response de cada endpoint, com exemplos, em
[`docs/backend.md`](../docs/backend.md#5-endpoints).

## O que ainda falta

- Endpoint de cadastro (`POST /login` existe, mas não há criação de usuário)
- Recuperação de senha
- Sessão/token — hoje o front-end guarda o `usuario_id` só em memória (state de navegação)
- Seed data para demonstração

Lista completa em [`docs/backend.md`](../docs/backend.md#7-o-que-ainda-falta).
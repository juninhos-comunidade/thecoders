# theCoders Cases

## 📋 Sobre o Projeto

O **theCoders Cases** é um simulador de cases em grupo voltado para pessoas iniciantes em TI (nível Estagiário e Junior) que estão se preparando para entrevistas de emprego. A aplicação recria a experiência de participar de um desafio técnico/comportamental em equipe, com tempo cronometrado, e ao final oferece uma avaliação de desempenho baseada em IA.
 
**Dor de mercado resolvida:** candidatos iniciantes em TI frequentemente chegam a processos seletivos sem nunca terem vivenciado a dinâmica real de um "case" em grupo — um formato comum em entrevistas técnicas e de trainee. Faltam ambientes de prática realistas, com feedback estruturado, que ajudem essas pessoas a chegar mais preparadas e confiantes nas entrevistas de verdade.

## 🛠️ Stack Utilizada

**Front-end**
- **React** — biblioteca para construção da interface
- **Vite** — ferramenta de build e ambiente de desenvolvimento
- **JavaScript** — linguagem principal do front-end
- **React Router (react-router-dom)** — navegação entre telas
- **Fetch API** — requisições HTTP para o back-end
- **Socket.IO Client** — comunicação em tempo real durante o case
- **ESLint** — padronização e análise de qualidade do código

**Back-end**
- **Python** + **FastAPI** — API
- **Supabase** (Postgres gerenciado) — banco de dados
- **Groq API** (`llama-3.3-70b-versatile`) — avaliação de soluções por IA
- **bcrypt** — hash e verificação de senha

## 💻 Instalação e Execução Local

Pré-requisitos: [Node.js](https://nodejs.org), Python 3.11+, uma conta no
[Supabase](https://supabase.com) com acesso ao projeto do time, e uma chave
da [Groq](https://console.groq.com/keys) (gratuita, sem cartão de crédito).
 
A aplicação tem duas partes que precisam rodar ao mesmo tempo: o back-end
(API) e o front-end (interface). Abra dois terminais.
 
### 1. Back-end (`thecoders-cases-back`)
 
```bash
cd thecoders-cases-back
 
# criar e ativar o ambiente virtual
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows (PowerShell)
# source .venv/bin/activate     # Linux/macOS
 
# instalar dependências
pip install -r requirements.txt
```
 
Crie um arquivo `.env` dentro de `thecoders-cases-back` com:
 
```env
SUPABASE_URL=https://soquaptpgdmltauxjmcu.supabase.co
SUPABASE_KEY=sua_chave_do_supabase
GROQ_API_KEY=sua_chave_da_groq
```
 
Suba o servidor (a partir da raiz de `thecoders-cases-back`):
 
```bash
uvicorn main:app --reload
```
 
API disponível em `http://127.0.0.1:8000` (Swagger em `/docs`).
 
### 2. Front-end (`thecoders-cases`)
 
Em outro terminal:
 
```bash
cd thecoders-cases
npm i
npm run dev
```
 
Interface disponível em `http://localhost:5173`, já configurada para
conversar com o back-end em `http://127.0.0.1:8000` (`src/config/api.js`).
 
> Detalhes completos de cada parte (estrutura de pastas, banco de dados,
> endpoints) em [`thecoders-cases-back/README.md`](./thecoders-cases-back/README.md)
> e em [`docs/backend.md`](./docs/backend.md) / [`docs/frontend.md`](./docs/frontend.md).

Após rodar o último comando, o projeto estará disponível em `http://localhost:5173`.

## 🔗 Links

- Figma: [http://www.figma.com/thecoders](https://www.figma.com/design/xk03DfXgICPo7s0HykliQF/TheCoders?node-id=0-1&t=cAJjueXIPFcMMhNE-1)
- Deploy: http://thecoders-front.onrender.com/
- Notion: [http://www.notion.so/thecoders](https://app.notion.com/p/PLANEJAMENTO-THECODERS-HACKA-JUNINHOS-75f32116964b8297bdd701a304263997?source=copy_link) 

## 🤖 Inteligências Artificiais Utilizadas

- **ChatGPT - GPT-5.6 Luna:**
  - Geração dos READMEs;
  - Geração da documentação do projeto;
- **Claude - Sonnet 5:**
  - Auxílio em alguns componentes do front-end;
  - Auxílio na implementação de algumas funcionalidades do back-end;
- **Groq - llama-3.3-70b-versatile:**
  - Análise de desempenho dos usuários com base nas respostas enviadas



## 👥 Equipe e Responsabilidades

- **Matheus** — telas de Cadastro e Recuperação de Senha
- **Rhaísa** — Tutorial, carrossel de introdução e explicação de confidencialidade
- **Laís** — telas de Lobby/Case e Resultado Final
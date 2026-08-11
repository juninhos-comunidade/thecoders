# theCoders Cases — Frontend

Interface do **theCoders Cases**, um simulador de cases em grupo para
candidatos iniciantes em TI (Estagiário/Júnior), com avaliação de desempenho
apoiada por IA. Para a visão geral do produto, veja o
[README da raiz do projeto](../README.md).

> Documentação técnica completa (rotas, páginas, componentes) em
> [`docs/frontend.md`](../docs/frontend.md).

## Stack

- **React 19** — biblioteca de UI
- **Vite** — build e dev server
- **react-router-dom** — roteamento entre telas
- **lucide-react**, **react-icons** — ícones
- **ESLint** — padronização de código

## Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado.

```bash
cd thecoders-cases
npm i
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

Para as telas de `Login` e `Tutorial` funcionarem de verdade (as únicas já
integradas com a API — ver [`docs/frontend.md`](../docs/frontend.md#7-estado-atual-e-próximos-passos)),
o back-end (`thecoders-cases-back`) precisa estar rodando em
`http://127.0.0.1:8000` — veja o [README do backend](../thecoders-cases-back/README.md).

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento (`http://localhost:5173`) |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve localmente o build de produção, para testar antes do deploy |
| `npm run lint` | Roda o ESLint em todo o projeto |

## Estrutura de pastas

```
thecoders-cases/src/
├── assets/       # logos, ícones e ilustrações estáticas
├── components/   # componentes reutilizáveis entre páginas
├── pages/        # uma pasta por tela, cada uma com index.jsx + index.css
├── App.jsx       # componente raiz, apenas renderiza o Router
├── main.jsx      # entrypoint (ReactDOM.createRoot)
└── router.jsx    # definição de todas as rotas
```

Rotas, páginas e componentes documentados em detalhe em
[`docs/frontend.md`](../docs/frontend.md).

## Deploy

Render.
# theCoders Cases Backend

## Visão Geral

Este diretório é responsável pelo backend do projeto theCoders Cases. Ele será responsável por gerenciar a lógica de negócios, autenticação, armazenamento de dados, processamento dos cases e integração com serviços externos, como IA e avaliação de desempenho.

Atualmente, esta pasta está em fase inicial e serve como base para o desenvolvimento da API e dos serviços do sistema.

## Objetivo do Projeto

O backend do theCoders Cases deve:

- autenticar usuários e administradores;
- gerenciar cadastros, login e recuperação de senha;
- controlar o fluxo dos cases e das partidas;
- armazenar informações dos usuários e dos resultados;
- integrar análise de desempenho e feedback;
- expor endpoints para o frontend consumir dados em tempo real.

## Stack sugerida

A stack pode ser definida conforme a necessidade do time, mas, em geral, o backend do projeto pode ser estruturado com:

- Node.js
- Express.js ou Fastify
- PostgreSQL ou outro banco relacional
- Prisma, Sequelize ou ORM equivalente
- JWT para autenticação
- dotenv para variáveis de ambiente
- ESLint/Prettier para padronização

## Estrutura de Pastas

```text
thecoders-cases-back/
├── README.md
├── package.json
├── .env.example
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── utils/
│   └── validations/
├── prisma/
│   └── schema.prisma
├── tests/
│   └── ...
└── docs/
    └── ...
```

## Requisitos

Antes de iniciar o desenvolvimento, certifique-se de ter instalado:

- Node.js 18+
- npm ou yarn
- Banco de dados configurado (ex.: PostgreSQL)
- Editor de código (VS Code recomendado)

## Instalação

```bash
# entrar na pasta do backend
cd thecoders-cases-back

# instalar dependências
npm install
```

## Configuração de Ambiente

Crie um arquivo `.env` com base no `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/thecoders
JWT_SECRET=sua_chave_secreta
```

## Scripts

Os scripts abaixo são exemplos de como o backend pode ser executado:

```bash
# desenvolvimento
npm run dev

# produção
npm run build
npm run start

# testes
npm run test
```

## Rotas Planejadas

Algumas rotas esperadas para o projeto incluem:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/forgot-password`
- `GET /users/:id`
- `GET /cases`
- `POST /cases`
- `GET /results/:userId`
- `POST /results/evaluate`

A estrutura exata das rotas pode mudar conforme a evolução do backend.

## Fluxo de Trabalho

1. Definir a arquitetura da API.
2. Criar modelos e relacionamento do banco.
3. Desenvolver autenticação e autorização.
4. Implementar os endpoints principais.
5. Integrar regras de negócio e avaliação de casos.
6. Validar com testes e documentação.

## Boas Práticas

- manter endpoints bem organizados;
- validar dados de entrada;
- proteger rotas sensíveis com autenticação;
- separar regras de negócio em services;
- documentar erros e respostas da API;
- usar variáveis de ambiente para configurações sensíveis.

## Contribuição

Para contribuir com este módulo:

1. crie uma branch para a funcionalidade;
2. desenvolva a implementação com testes;
3. valide o comportamento localmente;
4. envie a alteração por pull request com descrição clara.

## Observação

Este README foi criado como base inicial para a pasta do backend. Conforme o projeto evoluir, os itens acima devem ser ajustados para refletir a arquitetura final, os endpoints reais e as tecnologias escolhidas.

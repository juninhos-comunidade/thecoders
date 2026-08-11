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
| Lint | ESLint | ^10.6.0 |

> ⚠️ O README principal do projeto menciona **Axios** para comunicação com o
> back-end, mas o pacote não está nas dependências atuais (`package.json`).
> Como a aplicação ainda roda 100% com dados mockados (`console.log`, valores
> fixos em `useState`), isso não é um problema agora — mas fica o alerta para
> quando a integração com a API for feita.

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
├── pages/              # uma pasta por tela, cada uma com index.jsx + index.css
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

Já integrado com o back-end: no submit, chama `POST http://127.0.0.1:8000/login`.
Se `primeiro_login` vier `true` na resposta, navega para `/tutorial`; senão,
para `/lobby` — em ambos os casos passando `usuarioId` via `state` de
navegação do React Router. Erro de autenticação (401) exibe mensagem inline;
falha de conexão com o servidor também é tratada com mensagem própria.

> ⚠️ A URL da API está hardcoded (`http://127.0.0.1:8000`) — vai quebrar em
> produção quando o back-end estiver no Render. Vale extrair para uma
> variável de ambiente (`VITE_API_URL`) antes do deploy.

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
`PATCH http://127.0.0.1:8000/usuarios/{usuarioId}/tutorial-visto` (usando o
`usuarioId` recebido via `state` da navegação vinda do `Login`) para marcar
`primeiro_login` como `false`, e só então navega para `/lobby`. Se a chamada
falhar, o erro é só logado no console — a navegação para `/lobby` acontece de
qualquer forma (evita travar o usuário por causa de uma falha de rede nessa
etapa não-crítica).

### `Lobby` (`/lobby`)
Tela principal pós-login: `Navbar` + `CardProfile` (nível, XP, próximo nível)
+ `CardCases` (cases concluídos, dificuldade atual, atalho para o último
resultado e para iniciar um novo case). Todos os valores estão hardcoded
(`nivel="E"`, `exp="0"` etc.) aguardando integração com dados reais de usuário.

### `OnCase` (`/on-case`)
Tela do case em si: entra automaticamente em tela cheia (com fallback no
primeiro clique/tecla, caso o navegador bloqueie), e sai da tela cheia ao
desmontar. Renderiza `CaseDescription` (enunciado + cronômetro) e `ChatBox`
lado a lado.

### `ProcessingSolution` (`/processing-solution`)
Tela de transição com checklist de "etapas de avaliação da IA" (atualmente
estático) e contagem regressiva de 5 segundos que redireciona automaticamente
para `/lobby`.

### `LastResult` (`/last-result`)
Exibe o resultado do último case: `Score` (notas por competência) e `Resume`
(feedback textual em HTML, renderizado via `dangerouslySetInnerHTML`).

## 6. Componentes

| Componente | Usado em | Função |
|---|---|---|
| `Navbar` | Lobby, LastResult | Cabeçalho com logo, atalho para `/tutorial`, nível do usuário (`Nivel`) e ícone de perfil (`ProfileIcon`) |
| `Nivel` | Navbar | Badge com a letra do nível atual (ex: "E" de Estagiário) |
| `ProfileIcon` | Navbar | Botão de acesso ao perfil (ícone SVG inline) |
| `CardProfile` | Lobby | Card com nível atual, barra de progresso de XP e próximo nível |
| `CardCases` | Lobby | Card com cases concluídos, dificuldade e atalhos para iniciar/ver resultado |
| `Buttons` | CardCases, LastResult | Botão genérico com variantes `primary`/`white`, navega via `page` prop |
| `CaseDescription` | OnCase | Título, dificuldade, `Timer` circular e descrição do case, com `SendMsgBar` para envio da solução |
| `ChatBox` | OnCase | Chat lateral da sala, mantém mensagens em estado local |
| `SendMsgBar` | CaseDescription, ChatBox | Input + botão de envio reutilizável; pode navegar para outra rota ao submeter (`navigateOnSubmit`) ou apenas disparar um callback (`onSubmit`) |
| `Timer` | CaseDescription | Cronômetro circular (SVG) com contagem regressiva e barra de progresso animada |
| `Score` | LastResult | Tabela de notas por competência (raciocínio lógico, qualidade técnica, etc.) |
| `Resume` | LastResult | Bloco de feedback textual (HTML) |

## 7. Estado atual e próximos passos

- **Integração parcial com o back-end**: `Login` e `Tutorial` já consomem a
  API real (`POST /login`, `PATCH /usuarios/{id}/tutorial-visto`). As demais
  telas (`Lobby`, `OnCase`, `ProcessingSolution`, `LastResult`) ainda usam
  dados mockados. O endpoint `POST /avaliacao` já devolve `notas_categorias`
  no formato exato esperado pela prop `notas` do componente `Score` — ver
  [`backend.md`](./backend.md#5-endpoints).
- **URL da API hardcoded**: `Login` e `Tutorial` chamam `http://127.0.0.1:8000`
  diretamente no código. Antes do deploy, extrair para uma variável de
  ambiente (`VITE_API_URL` ou similar) que aponte para a URL do Render em
  produção.
- **`usuarioId` só existe em memória**: passado via `state` de navegação do
  React Router entre `Login` → `Tutorial`/`Lobby`. Um refresh de página perde
  essa informação, já que não há token/sessão persistida (ver
  [`backend.md`](./backend.md#7-o-que-ainda-falta)).
- **Validação de formulário**: `CadastroPage` só valida coincidência de
  e-mail/senha; não há validação de formato de CPF, força de senha ou
  feedback de erro do back-end. `CadastroPage` também ainda não chama
  nenhuma API — não existe endpoint de cadastro no back-end ainda.
- **Login social**: os botões de Google/Apple/LinkedIn ainda não disparam
  nenhum fluxo de OAuth real.

## 8. Rastreabilidade com o edital

Este documento, junto com `arquitetura.md`, atende ao requisito do edital
(seção 4) de que o `README`/documentação do repositório explique claramente
a aplicação e sirva de base para a avaliação de **Arquitetura de Código e
Qualidade Técnica** (critério de até 25 pontos).
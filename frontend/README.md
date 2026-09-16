<!-- prettier-ignore -->
<div align="center">

<img src="./public/favicon.ico" alt="" align="center" height="64" />

# Frontend

*Interface Angular do JobApplications, com autenticação e gestão de Candidaturas e Plataformas.*

[Visão geral](#visão-geral) • [Rotas](#rotas) • [Início rápido](#início-rápido) • [Estrutura](#estrutura) • [Comandos](#comandos)

</div>

## Visão geral

Aplicação Angular 22 com Angular Material e SSR. O dev server usa `proxy.conf.js` para encaminhar `/api`, `/admin` e `/static` ao backend em `http://localhost:8000`, então o frontend em `http://localhost:4200` fala com a API sem CORS em desenvolvimento.

## Rotas

| Rota           | Tela                              | Acesso     |
| -------------- | --------------------------------- | ---------- |
| `/login`       | Login                             | Pública    |
| `/`            | Home                              | Autenticado |
| `/plataforma`  | Lista, cria, edita e exclui Plataformas | Autenticado |
| `/candidatura` | Lista, cria, edita e exclui Candidaturas | Autenticado |

As rotas autenticadas passam pelo `authGuard` dentro do `ShellComponent`. O menu lateral inclui link para o `/admin/` do Django quando o usuário é admin.

## Início rápido

### Pré-requisitos

- [Node.js](https://nodejs.org/) e npm (o projeto usa npm 11)
- Backend rodando em `http://localhost:8000` (ver `backend/README.md`)

Execute os comandos a partir de `frontend/`:

```powershell
cd frontend
npm ci
npm start
```

Abra [http://localhost:4200](http://localhost:4200).

> [!TIP]
> Para apontar para outro backend, defina `BACKEND_URL` antes do `npm start`: o proxy usa `process.env.BACKEND_URL` com fallback para `http://localhost:8000`.

## Estrutura

```text
frontend/src/app/
├── core/      # guards, interceptors, models e services (auth, token, plataforma, candidatura)
├── features/  # telas: login, home, plataforma, candidatura
├── layout/    # shell com menu lateral e toolbar
└── shared/    # components, listagem, dialogo-salvar, models, services, utils
```

Os módulos compartilhados concentram o comportamento repetido: `shared/listagem/` orquestra busca, paginação e exclusão das duas telas; `shared/dialogo-salvar/` orquestra o salvar dos dois diálogos; `shared/components/confirmacao-exclusao-dialog/` é a confirmação neutra usada por ambos.

> [!NOTE]
> `AuthService` guarda os tokens em `localStorage` via helper SSR-safe: `localStorage` é indefinido no servidor. `NotificacaoService.erro()` depende do contrato de erro `{"detail": ...}` da API.

## Comandos

Execute em `frontend/`:

```powershell
npm start                  # dev server com proxy para o backend
npm test                   # testes unitários (Vitest via @angular/build:unit-test)
npm run build              # build de produção com SSR
npx prettier --write .     # formatação (4 espaços, aspas simples, printWidth 100)
```

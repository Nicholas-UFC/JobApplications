<!-- prettier-ignore -->
<div align="center">

<img src="frontend/public/favicon.ico" alt="" align="center" height="64" />

# JobApplications

_Acompanhe candidaturas de emprego e as plataformas em que foram registradas._

[Visão geral](#visão-geral) • [Recursos](#recursos) • [Stack](#stack) • [Início rápido](#início-rápido) • [API](#api) • [Estrutura](#estrutura) • [Documentação](#documentação) • [Comandos](#comandos)

</div>

## Visão geral

Aplicação full-stack para organizar a busca por emprego. O backend expõe uma API REST documentada e protegida por JWT; o frontend oferece uma interface Angular com autenticação e acesso ao painel administrativo do Django. O banco é um SQLite local gerado pelas migrações.

## Recursos

- **Plataformas e Candidaturas** — cadastro, consulta, edição, exclusão, busca textual, filtros, ordenação e paginação.
- **Status de Candidatura** — enviado, rejeitado, entrevista, proposta recebida e aprovada.
- **Autenticação JWT** — login, renovação de token com blacklist e proteção de rotas no frontend.
- **Histórico e admin** — histórico de alterações (`simple_history`) e painel administrativo com Jazzmin.
- **Health check público** — status da aplicação e do banco de dados.

## Stack

| Camada    | Tecnologias                                         |
| --------- | --------------------------------------------------- |
| Backend   | Python 3.14+, Django 6.1, Django Ninja, JWT, SQLite |
| Frontend  | Angular 22, Angular Material, TypeScript, SCSS, SSR |
| Qualidade | pytest, Ruff, Bandit, Vitest, Prettier              |

## Início rápido

### Via Docker (recomendado)

Pré-requisito: [Docker](https://www.docker.com/) com Compose.

1. Crie o arquivo de ambiente na raiz do repositório:

   ```powershell
   Copy-Item .env.example .env
   ```

   Defina `SECRET_KEY` com uma chave segura, `DEBUG=True` para desenvolvimento
   e `POSTGRES_PASSWORD` com senha forte. Se a porta `5432` estiver ocupada,
   ajuste `POSTGRES_EXPOSTA` (ex.: `5433`).

2. Suba a stack (Postgres + backend + frontend):

   ```powershell
   docker compose up -d --build
   ```

Abra [http://localhost:4000](http://localhost:4000). O servidor SSR encaminha
`/api`, `/admin` e `/static` para o backend. A API responde em
[http://localhost:8000/api/health](http://localhost:8000/api/health). O
superusuário de `ADMIN_USER`/`ADMIN_PASSWORD` é criado no boot do backend.
Dados do Postgres persistem no volume `pgdata`.

```powershell
docker compose ps           # estado e saúde dos serviços
docker compose logs backend # migrações, superusuário, erros da API
docker compose down         # parar (mantém o volume pgdata)
docker compose down -v      # parar e apagar o banco
```

### Via ambiente local (sem Docker)

Pré-requisitos: [Python](https://www.python.org/) 3.14 + [uv](https://docs.astral.sh/uv/)
e [Node.js](https://nodejs.org/) com npm 11.

1. Crie o `.env` na raiz (`Copy-Item .env.example .env`). Sem
   `POSTGRES_HOST` o backend usa SQLite em `database/db.sqlite3`.

2. Em um terminal, inicie a API:

   ```powershell
   cd backend
   uv sync
   uv run python manage.py migrate
   uv run python manage.py runserver
   ```

   Opcional: `uv run python manage.py createsuperuser`.

3. Em outro terminal, inicie o frontend:

   ```powershell
   cd frontend
   npm ci
   npm start
   ```

Abra [http://localhost:4200](http://localhost:4200). O dev server encaminha
`/api`, `/admin` e `/static` para `http://localhost:8000`.

> [!IMPORTANT]
> Sem Docker, clone novo exige `migrate` antes de rodar: o banco SQLite é
> criado em `database/db.sqlite3` e não é versionado. O arquivo `.env` deve
> permanecer na raiz do repositório.

## API

Base em `http://localhost:8000/api/`, com documentação interativa do Django Ninja em `http://localhost:8000/api/docs`. Todas as rotas, exceto login e health check, exigem `Authorization: Bearer <access-token>`.

| Recurso      | Rotas principais                                                                              |
| ------------ | --------------------------------------------------------------------------------------------- |
| Autenticação | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/verify`, `GET /api/auth/me` |
| Plataformas  | `GET`, `POST /api/plataforma/`; `GET`, `PUT`, `DELETE /api/plataforma/{id}`                   |
| Candidaturas | `GET`, `POST /api/candidatura/`; `GET`, `PUT`, `DELETE /api/candidatura/{id}`                 |
| Saúde        | `GET /api/health`                                                                             |

As listagens aceitam paginação (`page`, `page_size`) e filtros como `ativo`, `busca` e `ordenacao` (prefixo `-` inverte). Candidaturas também aceitam `status` e `plataforma_id`. Erros seguem o contrato `{"detail": "mensagem"}`.

## Estrutura

```text
backend/    # API Django, regras de negócio e testes
frontend/   # Aplicação Angular com Angular Material e SSR
database/   # Banco SQLite local, gerado pelas migrações
.agents/    # Instruções e skills para agentes
```

## Documentação

Cada área tem seu próprio README com setup detalhado, estrutura interna e comandos:

- [backend/README.md](backend/README.md) — API, apps, `utils/` e qualidade.
- [frontend/README.md](frontend/README.md) — rotas, `core/`/`features/`/`shared/` e proxy.
- [database/README.md](database/README.md) — criação, reset, backup e solução de problemas.

> [!TIP]
> Comece pelo README da área que vai alterar; o README geral cobre apenas o fluxo ponta a ponta.

## Comandos

Execute os comandos do backend em `backend/`:

```powershell
uv run pytest
uv run ruff check .
uv run ruff format .
uv run bandit -c pyproject.toml -r .
```

Execute os comandos do frontend em `frontend/`:

```powershell
npm test
npm run build
npx prettier --write .
```

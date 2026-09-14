# AGENTS.md — JobApplications

Guia para agentes de IA (OpenCode e similares) trabalhando neste repositório.
Carregado pelo OpenCode via `opencode.json` → `instructions`.

## Visão geral

Monorepo com backend Django 6.1 + django-ninja, frontend Angular 22 (SSR) e
banco SQLite. Nomenclatura, mensagens de API e comentários são em português —
siga esse padrão.

## Estrutura

- `backend/` — API Django (uv, Python 3.14)
- `frontend/` — SPA Angular 22 + Material, com SSR
- `database/` — `db.sqlite3` (ignorado pelo git; criar via `migrate`)
- `.agents/` — configuração e instruções para agentes
- `.env` fica na raiz do repo, não em `backend/`

## Backend (executar de `backend/`)

- Instalar deps: `uv sync`
- Dev server: `uv run python manage.py runserver`
- Migrations: `uv run python manage.py makemigrations` / `migrate`
- Testes: `uv run pytest` (config em `pyproject.toml`, roda com coverage)
- Teste único: `uv run pytest caminho/tests.py::Teste::test_metodo`
- Lint: `uv run ruff check .` · Formatar: `uv run ruff format .`
- Segurança: `uv run bandit -c pyproject.toml -r .`
- Ruff: line-length 79, aspas duplas, migrations excluídas, `target-version`
  py312 (mesmo com `requires-python >=3.14`).
- `config/settings.py`: `BASE_DIR` = raiz do repo; `.env` exige `SECRET_KEY` e
  `DEBUG` (precisa ser exatamente `"True"`). SQLite em `database/db.sqlite3` —
  `psycopg` está nas dependências mas não é usado.

## API

- Montada em `/api/` (`config/urls.py`); admin Django em `/admin/`.
- Autenticação JWT global (`JWTAuth`); rotas públicas declaram `auth=None`.
- Endpoints JWT: `/api/auth/login|refresh|verify`; `/api/auth/me` é autenticado.
- Apps: `autenticacao` (sem models), `plataforma`, `candidatura`, `healthcheck`.
- `utils/`: `BaseModel` (nome, ativo, timestamps, `simple_history`), schemas
  base, `mensagens.py`, handler global de exceções (`{"detail": ...}`; em
  `DEBUG` relança).
- Cada app tem `api.py` (router), `schemas.py`, `models.py`, `admin.py`.
  `_aplicar_ordenacao` e a paginação são duplicados por app.

## Frontend (executar de `frontend/`)

- Dev: `npm start` (proxy `proxy.conf.js` → backend `:8000`, inclui `/admin` e
  `/static`).
- Build: `npm run build` · Testes: `npm test` (Vitest via
  `@angular/build:unit-test`).
- Sem script de lint; formatar com `npx prettier --write .` (`.prettierrc`:
  4 espaços, aspas simples, printWidth 100).
- Pastas: `core/` (guards, interceptors, models, services), `features/`,
  `layout/`, `shared/services/`.
- `AuthService` guarda tokens em `localStorage` via helper SSR-safe
  (`localStorage` é indefinido no servidor).
- `NotificacaoService.erro()` depende do contrato de erro `{"detail": ...}`.

## Convenções

- Novo model herda de `utils.basemodel.BaseModel`; schemas de leitura/criação/
  atualização vêm de `utils.baseschemas`.
- Mensagens de erro centralizadas em `utils/mensagens.py`.
- Clone novo exige `migrate` antes de rodar (o `db.sqlite3` não é versionado).

## Gotchas

- `.env` na raiz é obrigatório; sem ele `SECRET_KEY` fica `None`.
- `frontend/` é recém-adicionado e ainda não está commitado.

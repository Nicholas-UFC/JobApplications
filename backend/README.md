<!-- prettier-ignore -->
<div align="center">

<img src="../frontend/public/favicon.ico" alt="" align="center" height="64" />

# Backend

*API REST em Django + Django Ninja para o JobApplications.*

[Visão geral](#visão-geral) • [Recursos](#recursos) • [Início rápido](#início-rápido) • [API](#api) • [Estrutura](#estrutura) • [Comandos](#comandos)

</div>

## Visão geral

O backend expõe a API do sistema em `/api/`, com documentação interativa do Django Ninja em `/api/docs`, e o painel administrativo do Django em `/admin/` (tema Jazzmin). A autenticação é JWT global: todas as rotas exigem `Authorization: Bearer <access-token>`, exceto login e health check, que declaram `auth=None`.

## Recursos

- CRUD de Plataformas e Candidaturas, com busca textual, filtros, ordenação e paginação.
- Status de Candidatura: enviado, rejeitado, entrevista, proposta recebida e aprovada.
- Autenticação JWT com renovação e blacklist de refresh tokens.
- Histórico de alterações (`simple_history`) e painel admin com Jazzmin.
- Health check público da aplicação e do banco.
- Erros no contrato `{"detail": "mensagem"}`; em `DEBUG` a exceção original é relançada.

## Início rápido

### Pré-requisitos

- [Python](https://www.python.org/) 3.14 ou superior e [uv](https://docs.astral.sh/uv/)
- Arquivo `.env` na **raiz do repositório** (não em `backend/`), com `SECRET_KEY` e `DEBUG`:

  ```powershell
  Copy-Item .env.example .env
  ```

  Defina `DEBUG=True` para desenvolvimento. Sem o `.env`, `SECRET_KEY` fica `None`.

Execute os comandos a partir de `backend/`:

```powershell
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

> [!IMPORTANT]
> Clone novo exige `migrate` antes de rodar: o banco SQLite é criado em `database/db.sqlite3` e não é versionado.

Opcionalmente, crie um usuário para entrar no sistema e acessar o admin:

```powershell
uv run python manage.py createsuperuser
```

## API

Base: `http://localhost:8000/api/`. Docs interativas: `http://localhost:8000/api/docs`.

| Recurso       | Rotas principais                                                                 |
| ------------- | -------------------------------------------------------------------------------- |
| Autenticação  | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/verify`, `GET /api/auth/me` |
| Plataformas   | `GET`, `POST /api/plataforma/`; `GET`, `PUT`, `DELETE /api/plataforma/{id}`       |
| Candidaturas  | `GET`, `POST /api/candidatura/`; `GET`, `PUT`, `DELETE /api/candidatura/{id}`     |
| Saúde         | `GET /api/health`                                                                |

As listagens aceitam `ativo`, `busca` e `ordenacao` (prefixo `-` inverte). Candidaturas também aceitam `status` e `plataforma_id`. A paginação usa `page` e `page_size`.

> [!NOTE]
> `psycopg` está nas dependências mas não é usado: o banco em desenvolvimento é SQLite.

## Estrutura

```text
backend/
├── autenticacao/   # Rotas de login e /me (sem models)
├── plataforma/     # Model, schemas, router e admin de Plataforma
├── candidatura/    # Model, schemas, router e admin de Candidatura
├── healthcheck/    # Health check público
├── utils/          # BaseModel, schemas base, listagem, CRUD, ordenação, mensagens, exceções
├── config/         # settings.py, urls.py (montagem em /api/ e /admin/)
└── manage.py
```

Cada app segue o padrão `api.py` (router), `schemas.py`, `models.py`, `admin.py`. Novos models herdam de `utils.basemodel.BaseModel` (nome, ativo, timestamps, `simple_history`) e os schemas de leitura/criação/atualização vêm de `utils.baseschemas`. Mensagens de erro ficam centralizadas em `utils/mensagens.py`.

## Comandos

Execute em `backend/`:

```powershell
uv run pytest                        # testes com coverage
uv run pytest caminho/test_listagem.py::test_nome   # teste único
uv run ruff check .                   # lint
uv run ruff format .                  # formatação
uv run bandit -c pyproject.toml -r .  # segurança
uv run python manage.py makemigrations # gerar migrações
uv run python manage.py migrate        # aplicar migrações
```

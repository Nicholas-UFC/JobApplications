# JobApplications

<p align="center">
  <img src="frontend/public/favicon.ico" alt="JobApplications" width="64" height="64">
</p>

<p align="center">Acompanhe candidaturas de emprego e as plataformas em que foram registradas.</p>

JobApplications é uma aplicação full-stack para organizar a busca por emprego. O backend disponibiliza uma API REST documentada e protegida por JWT; o frontend oferece uma interface Angular com autenticação e acesso ao painel administrativo do Django.

## Recursos

- Cadastro, consulta, edição, exclusão, busca, filtros e ordenação de plataformas e candidaturas.
- Status de candidatura: enviado, rejeitado, entrevista, proposta recebida e aprovada.
- Autenticação JWT, renovação de token e proteção de rotas no frontend.
- Paginação na API, histórico de alterações e painel administrativo com Jazzmin.
- Health check público para a aplicação e o banco de dados.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Backend | Python 3.14+, Django 6.1, Django Ninja, JWT, SQLite |
| Frontend | Angular 22, Angular Material, TypeScript, SCSS, SSR |
| Qualidade | pytest, Ruff, Bandit e Vitest |

## Início rápido

### Pré-requisitos

- [Python](https://www.python.org/) 3.14 ou superior e [uv](https://docs.astral.sh/uv/)
- [Node.js](https://nodejs.org/) e npm (o projeto usa npm 11)

1. Crie o arquivo de ambiente na raiz do repositório:

   ```powershell
   Copy-Item .env.example .env
   ```

   Defina `SECRET_KEY` com uma chave segura e `DEBUG=True` para desenvolvimento.

2. Em um terminal, instale as dependências, aplique as migrações e inicie a API:

   ```powershell
   cd backend
   uv sync
   uv run python manage.py migrate
   uv run python manage.py runserver
   ```

3. Opcionalmente, crie um usuário para entrar no sistema e acessar o admin:

   ```powershell
   cd backend
   uv run python manage.py createsuperuser
   ```

4. Em outro terminal, inicie o frontend:

   ```powershell
   cd frontend
   npm ci
   npm start
   ```

Abra [http://localhost:4200](http://localhost:4200). O servidor de desenvolvimento encaminha `/api`, `/admin` e `/static` para o backend em `http://localhost:8000`.

> [!NOTE]
> O banco SQLite é criado em `database/db.sqlite3` pelas migrações e não é versionado. O arquivo `.env` deve permanecer na raiz do repositório.

## API

A API está disponível em `http://localhost:8000/api/` e a documentação interativa do Django Ninja em `http://localhost:8000/api/docs`. Todas as rotas, exceto login e health check, exigem `Authorization: Bearer <access-token>`.

| Recurso | Rotas principais |
| --- | --- |
| Autenticação | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/verify`, `GET /api/auth/me` |
| Plataformas | `GET`, `POST /api/plataforma/`; `GET`, `PUT`, `DELETE /api/plataforma/{id}` |
| Candidaturas | `GET`, `POST /api/candidatura/`; `GET`, `PUT`, `DELETE /api/candidatura/{id}` |
| Saúde | `GET /api/health` |

As listagens aceitam paginação e podem receber filtros como `ativo`, `busca` e `ordenacao`. Candidaturas também aceitam `status` e `plataforma_id`.

## Estrutura

```text
backend/    # API Django, regras de negócio e testes
frontend/   # Aplicação Angular com Angular Material e SSR
database/   # Banco SQLite local, gerado pelas migrações
.agents/    # Instruções e skills para agentes
```

## Comandos úteis

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
```

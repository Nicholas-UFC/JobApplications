<!-- prettier-ignore -->
<div align="center">

<img src="../frontend/public/favicon.ico" alt="" align="center" height="64" />

# Database

_PostgreSQL no Docker; SQLite como fallback local. Esquema via migrações do Django._

[Visão geral](#visão-geral) • [Criação](#criação) • [Reset e backup](#reset-e-backup) • [Solução de problemas](#solução-de-problemas)

</div>

## Visão geral

No Docker (`compose.yaml`, serviço `db`), o banco é PostgreSQL 17 com dados
no volume `pgdata`; o backend conecta via `POSTGRES_*` do `.env` e as
migrações rodam no boot. Sem `POSTGRES_HOST` (ambiente local), o backend usa
SQLite em `database/db.sqlite3`, configurado em
`backend/config/settings.py`. O arquivo SQLite não é versionado
(`*.sqlite3` está no `.gitignore`); um `.gitkeep` mantém a pasta no clone.

## Criação

No Docker, na raiz do repositório (o `migrate` roda sozinho no boot):

```powershell
docker compose up -d --build
```

No ambiente local, a partir de `backend/`, com o `.env` na raiz:

```powershell
cd backend
uv run python manage.py migrate
```

> [!IMPORTANT]
> Sem Docker, clone novo exige `.env` com `SECRET_KEY` e `DEBUG=True`,
> seguido de `migrate`, antes de iniciar o backend ou o frontend.

## Reset e backup

No Docker, com a stack parada (`docker compose down`):

```powershell
docker compose down -v  # apaga o volume pgdata (perde todos os dados)
docker compose up -d    # recria o banco vazio e reaplica as migrações
```

Para backup do Postgres:

```powershell
docker compose exec db pg_dump -U jobapplications jobapplications > backup.sql
```

No SQLite local, com o servidor parado:

```powershell
Remove-Item ..\database\db.sqlite3
uv run python manage.py migrate
```

Não há migrações manuais: o esquema evolui via `makemigrations`/`migrate`.

## Solução de problemas

| Sintoma                  | Causa provável         | Ação                                                  |
| ------------------------ | ---------------------- | ----------------------------------------------------- |
| `no such table` (local)  | `migrate` não aplicado | Rodar `uv run python manage.py migrate` em `backend/` |
| `SECRET_KEY` fica `None` | `.env` ausente na raiz | Copiar `.env.example` para `.env` na raiz             |
| Porta `5432` ocupada     | Outro Postgres no host | Definir `POSTGRES_EXPOSTA=5433` no `.env`             |
| Arquivo SQLite travado   | Servidor ainda rodando | Parar backend/frontend antes de apagar ou copiar      |

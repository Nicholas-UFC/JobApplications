<!-- prettier-ignore -->
<div align="center">

<img src="../frontend/public/favicon.ico" alt="" align="center" height="64" />

# Database

*SQLite local do JobApplications, criado pelas migrações do Django.*

[Visão geral](#visão-geral) • [Criação](#criação) • [Reset e backup](#reset-e-backup) • [Solução de problemas](#solução-de-problemas)

</div>

## Visão geral

O banco é um arquivo SQLite em `database/db.sqlite3`, configurado em `backend/config/settings.py` a partir da raiz do repositório. O arquivo não é versionado (`*.sqlite3` está no `.gitignore`); um `.gitkeep` mantém a pasta no clone.

## Criação

Execute a partir de `backend/`, com o `.env` na raiz do repositório:

```powershell
cd backend
uv run python manage.py migrate
```

> [!IMPORTANT]
> Clone novo exige `.env` com `SECRET_KEY` e `DEBUG=True`, seguido de `migrate`, antes de iniciar o backend ou o frontend.

## Reset e backup

Para recomeçar do zero, com o servidor parado:

```powershell
Remove-Item ..\database\db.sqlite3
uv run python manage.py migrate
```

Para backup, basta copiar o arquivo `db.sqlite3` com o servidor parado. Não há dumps nem migrações manuais: o esquema evolui via `makemigrations`/`migrate` no backend.

## Solução de problemas

| Sintoma | Causa provável | Ação |
| ------- | -------------- | ---- |
| `no such table` ao rodar | `migrate` não aplicado | Rodar `uv run python manage.py migrate` em `backend/` |
| `SECRET_KEY` fica `None` | `.env` ausente na raiz | Copiar `.env.example` para `.env` na raiz |
| Arquivo travado no Windows | Servidor ainda rodando | Parar backend/frontend antes de apagar ou copiar |

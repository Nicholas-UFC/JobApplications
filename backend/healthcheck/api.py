from django.db import connection
from django.http import HttpRequest
from ninja import Router

router_healthcheck = Router()


@router_healthcheck.get("/health", auth=None)
def healthcheck(request: HttpRequest) -> dict[str, str]:  # noqa: ARG001
    connection.ensure_connection()
    return {"status": "ok", "database": "ok"}

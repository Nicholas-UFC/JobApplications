"""Tratamento uniforme de exceções não tratadas da API."""

import logging

from django.conf import settings
from django.http import HttpRequest, HttpResponse
from ninja import NinjaAPI

from utils.mensagens import ERRO_INTERNO

logger = logging.getLogger(__name__)


def registrar_erro_nao_tratado(api: NinjaAPI) -> None:
    def _erro_nao_tratado(
        request: HttpRequest, exc: Exception
    ) -> HttpResponse:
        logger.error("Erro não tratado na API", exc_info=exc)
        if settings.DEBUG:
            raise exc
        return api.create_response(
            request, {"detail": ERRO_INTERNO}, status=500
        )

    api.add_exception_handler(Exception, _erro_nao_tratado)

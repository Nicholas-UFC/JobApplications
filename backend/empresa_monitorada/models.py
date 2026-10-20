from datetime import UTC, datetime
from typing import ClassVar

from django.db import models
from django.db.models.functions import Lower

from utils.basemodel import BaseModel

# Sentinel para "nunca consultada": ano 1 é exibido como um valor absurdo
# na interface, deixando claro que a empresa ainda não foi verificada.
ULTIMA_CONSULTA_VAZIA = datetime(1, 1, 1, tzinfo=UTC)


class EmpresaMonitorada(BaseModel):
    url_vagas = models.URLField(verbose_name="URL de vagas")
    ultima_consulta = models.DateTimeField(
        default=ULTIMA_CONSULTA_VAZIA,
        verbose_name="Última consulta",
    )

    class Meta:
        verbose_name = "Empresa monitorada"
        verbose_name_plural = "Empresas monitoradas"
        ordering = ("ultima_consulta", "nome")
        constraints: ClassVar[list[models.BaseConstraint]] = [
            models.UniqueConstraint(
                Lower("nome"),
                name="empresa_monitorada_nome_unico_ci",
            )
        ]

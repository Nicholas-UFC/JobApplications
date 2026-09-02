from django.db import models

from plataforma.models import Plataforma
from utils.basemodel import BaseModel


class Candidatura(BaseModel):
    class StatusChoices(models.TextChoices):
        ENVIADO = "ENVIADO", "Enviado"
        REJEITADO = "REJEITADO", "Rejeitado"
        ENTREVISTA = "ENTREVISTA", "Entrevista"
        PROPOSTA = "PROPOSTA", "Proposta Recebida"
        APROVADA = "APROVADA", "Aprovada"

    empresa = models.CharField(max_length=255, verbose_name="Empresa")
    observacoes = models.TextField(blank=True, verbose_name="Observações")
    plataforma = models.ForeignKey(
        Plataforma,
        on_delete=models.PROTECT,
        related_name="candidaturas",
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ENVIADO,
        verbose_name="Status",
    )

    class Meta:
        verbose_name = "Candidatura"
        verbose_name_plural = "Candidaturas"
        ordering = ("nome",)

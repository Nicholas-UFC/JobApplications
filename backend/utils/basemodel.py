from django.db import models
from simple_history.models import HistoricalRecords


class BaseModel(models.Model):
    nome = models.CharField(max_length=255, verbose_name="Nome")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Criado em"
    )
    updated_at = models.DateTimeField(
        auto_now=True, verbose_name="Atualizado em"
    )
    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True

    def __str__(self) -> str:
        return self.nome

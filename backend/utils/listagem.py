"""Listagem paginada compartilhada entre os apps.

O seam recebe uma espec declarativa por adapter (mapas de busca e
ordenação mais filtros extras) e aplica o encadeamento completo:
ativo, filtros extras, busca textual e ordenação.
"""

from dataclasses import dataclass, field

from django.db.models import QuerySet

from utils.crud import filtrar_ativo, filtrar_busca
from utils.ordenacao import aplicar_ordenacao


@dataclass(frozen=True)
class EspecListagem:
    """O que muda entre Candidatura e Plataforma."""

    campos_busca: tuple[str, ...]
    campos_ordenacao: dict[str, str]
    filtros_extras: dict[str, object] = field(default_factory=dict)


def listar(
    queryset: QuerySet,
    espec: EspecListagem,
    *,
    ativo: bool | None = None,
    busca: str | None = None,
    ordenacao: str | None = None,
) -> QuerySet:
    """Aplica ativo, filtros extras, busca e ordenação nessa ordem."""
    queryset = filtrar_ativo(queryset, ativo)
    for campo, valor in espec.filtros_extras.items():
        if valor is not None and valor != "":
            queryset = queryset.filter(**{campo: valor})
    queryset = filtrar_busca(queryset, busca, espec.campos_busca)
    return aplicar_ordenacao(queryset, ordenacao, espec.campos_ordenacao)

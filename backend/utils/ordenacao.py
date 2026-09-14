from django.db.models import QuerySet
from ninja.errors import HttpError

from utils.mensagens import ORDENACAO_INVALIDA


def aplicar_ordenacao(
    queryset: QuerySet,
    ordenacao: str | None,
    campos_validos: dict[str, str],
) -> QuerySet:
    """Ordena o queryset pelo campo mapeado; erro 400 se inválido."""
    if not ordenacao:
        return queryset

    invertida = ordenacao.startswith("-")
    chave = ordenacao.lstrip("-")
    campo = campos_validos.get(chave)
    if campo is None:
        permitidos = ", ".join(sorted(campos_validos))
        raise HttpError(
            400,
            ORDENACAO_INVALIDA.format(
                ordenacao=ordenacao, permitidos=permitidos
            ),
        )

    return queryset.order_by(f"-{campo}" if invertida else campo)

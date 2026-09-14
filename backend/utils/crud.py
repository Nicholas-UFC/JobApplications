"""Operações CRUD compartilhadas entre os apps."""

from collections.abc import Iterable

from django.db.models import Model, ProtectedError, Q, QuerySet
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError


def obter_ou_404(
    model: type[Model],
    pk: int,
    *,
    select_related: Iterable[str] = (),
) -> Model:
    """Busca o objeto por pk; levanta 404 se não existir."""
    queryset = model.objects.all()
    if select_related:
        queryset = queryset.select_related(*select_related)
    return get_object_or_404(queryset, pk=pk)


def filtrar_ativo(queryset: QuerySet, ativo: bool | None) -> QuerySet:
    """Filtra por ativo apenas quando informado."""
    if ativo is None:
        return queryset
    return queryset.filter(ativo=ativo)


def filtrar_busca(
    queryset: QuerySet, busca: str | None, campos: Iterable[str]
) -> QuerySet:
    """Filtra por busca textual em qualquer dos campos (icontains)."""
    if not busca:
        return queryset
    filtro = Q()
    for campo in campos:
        filtro |= Q(**{f"{campo}__icontains": busca})
    return queryset.filter(filtro)


def garantir_nome_unico(
    model: type[Model],
    nome: str,
    mensagem: str,
    *,
    excluir_pk: int | None = None,
) -> None:
    """Levanta 409 se já existir outro registro com o mesmo nome."""
    consulta = model.objects.filter(nome=nome)
    if excluir_pk is not None:
        consulta = consulta.exclude(pk=excluir_pk)
    if consulta.exists():
        raise HttpError(409, mensagem.format(nome=nome))


def excluir_ou_409(obj: Model, mensagem: str) -> None:
    """Exclui o objeto; levanta 409 se houver vínculos protegidos."""
    try:
        obj.delete()
    except ProtectedError:
        raise HttpError(409, mensagem.format(nome=obj)) from None

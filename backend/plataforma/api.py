from django.db.models import Q, QuerySet
from django.db.models.deletion import ProtectedError
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError
from ninja.pagination import PageNumberPagination, paginate

from plataforma.models import Plataforma
from plataforma.schemas import (
    PlataformaCreateSchema,
    PlataformaSchema,
    PlataformaUpdateSchema,
)
from utils.mensagens import (
    ORDENACAO_INVALIDA,
    PLATAFORMA_EM_USO,
    PLATAFORMA_NOME_DUPLICADO,
)

router_plataforma = Router()

_CAMPO_ORDENACAO_CONVENIO = {
    "id": "id",
    "nome": "nome",
    "site_url": "site_url",
    "ativo": "ativo",
}


def _aplicar_ordenacao(
    queryset: QuerySet, ordenacao: str | None, campo_validos: dict[str, str]
) -> QuerySet:
    if not ordenacao:
        return queryset
    invertida = ordenacao.startswith("-")
    chave = ordenacao.lstrip("-")
    campo = campo_validos.get(chave)
    if campo is None:
        permitidos = ", ".join(sorted(campo_validos))
        raise HttpError(
            400,
            ORDENACAO_INVALIDA.format(
                ordenacao=ordenacao, permitidos=permitidos
            ),
        )
    return queryset.order_by(f"-{campo}" if invertida else campo)


@router_plataforma.get("/", response=list[PlataformaSchema])
@paginate(PageNumberPagination)
def listar_plataforma(
    request: HttpRequest,  # noqa: ARG001
    ativo: bool | None = None,
    busca: str | None = None,
    ordenacao: str | None = None,
    **kwargs: object,  # noqa: ARG001
) -> list[Plataforma]:
    plataforma = Plataforma.objects.all()
    if ativo is not None:
        plataforma = plataforma.filter(ativo=ativo)
    if busca:
        plataforma = plataforma.filter(Q(nome__icontains=busca))
    return _aplicar_ordenacao(plataforma, ordenacao, _CAMPO_ORDENACAO_CONVENIO)


@router_plataforma.get("/{plataforma_id}", response=PlataformaSchema)
def obter_plataforma(request: HttpRequest, plataforma_id: int) -> Plataforma:  # noqa: ARG001
    return get_object_or_404(Plataforma, pk=plataforma_id)


@router_plataforma.post("/", response=PlataformaSchema)
def criar_plataforma(
    request: HttpRequest,  # noqa: ARG001
    payload: PlataformaCreateSchema,
) -> Plataforma:
    if Plataforma.objects.filter(nome=payload.nome).exists():
        raise HttpError(
            409,
            PLATAFORMA_NOME_DUPLICADO.format(nome=payload.nome),
        )
    return Plataforma.objects.create(
        nome=payload.nome,
        site_url=payload.site_url,
        ativo=payload.ativo,
    )


@router_plataforma.put("/{plataforma_id}", response=PlataformaSchema)
def atualizar_plataforma(
    request: HttpRequest,  # noqa: ARG001
    plataforma_id: int,
    payload: PlataformaUpdateSchema,
) -> Plataforma:
    plataforma = get_object_or_404(Plataforma, pk=plataforma_id)
    if (
        Plataforma.objects.filter(nome=payload.nome)
        .exclude(pk=plataforma_id)
        .exists()
    ):
        raise HttpError(
            409,
            PLATAFORMA_NOME_DUPLICADO.format(nome=payload.nome),
        )
    plataforma.nome = payload.nome
    plataforma.site_url = payload.site_url
    plataforma.ativo = payload.ativo
    plataforma.save()
    return plataforma


@router_plataforma.delete("/{plataforma_id}", response=None)
def excluir_plataforma(
    request: HttpRequest,  # noqa: ARG001
    plataforma_id: int,
) -> HttpResponse:
    plataforma = get_object_or_404(Plataforma, pk=plataforma_id)
    try:
        plataforma.delete()
    except ProtectedError:
        raise HttpError(
            409,
            PLATAFORMA_EM_USO.format(nome=plataforma.nome),
        ) from None
    return HttpResponse(status=204)

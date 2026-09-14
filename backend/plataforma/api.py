from django.http import HttpRequest, HttpResponse
from ninja import Router
from ninja.pagination import PageNumberPagination, paginate

from plataforma.models import Plataforma
from plataforma.schemas import (
    PlataformaCreateSchema,
    PlataformaSchema,
    PlataformaUpdateSchema,
)
from utils.crud import (
    excluir_ou_409,
    filtrar_ativo,
    filtrar_busca,
    garantir_nome_unico,
    obter_ou_404,
)
from utils.mensagens import (
    PLATAFORMA_EM_USO,
    PLATAFORMA_NOME_DUPLICADO,
)
from utils.ordenacao import aplicar_ordenacao

router_plataforma = Router()

_CAMPOS_ORDENACAO_PLATAFORMA = {
    "id": "id",
    "nome": "nome",
    "site_url": "site_url",
    "ativo": "ativo",
}

_CAMPOS_BUSCA_PLATAFORMA = ("nome",)


@router_plataforma.get("/", response=list[PlataformaSchema])
@paginate(PageNumberPagination)
def listar_plataforma(
    request: HttpRequest,  # noqa: ARG001
    ativo: bool | None = None,
    busca: str | None = None,
    ordenacao: str | None = None,
    **kwargs: object,  # noqa: ARG001
) -> list[Plataforma]:
    plataformas = filtrar_busca(
        filtrar_ativo(Plataforma.objects.all(), ativo),
        busca,
        _CAMPOS_BUSCA_PLATAFORMA,
    )
    return aplicar_ordenacao(
        plataformas, ordenacao, _CAMPOS_ORDENACAO_PLATAFORMA
    )


@router_plataforma.get("/{plataforma_id}", response=PlataformaSchema)
def obter_plataforma(request: HttpRequest, plataforma_id: int) -> Plataforma:  # noqa: ARG001
    return obter_ou_404(Plataforma, plataforma_id)


@router_plataforma.post("/", response=PlataformaSchema)
def criar_plataforma(
    request: HttpRequest,  # noqa: ARG001
    payload: PlataformaCreateSchema,
) -> Plataforma:
    garantir_nome_unico(Plataforma, payload.nome, PLATAFORMA_NOME_DUPLICADO)
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
    plataforma = obter_ou_404(Plataforma, plataforma_id)
    garantir_nome_unico(
        Plataforma,
        payload.nome,
        PLATAFORMA_NOME_DUPLICADO,
        excluir_pk=plataforma_id,
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
    plataforma = obter_ou_404(Plataforma, plataforma_id)
    excluir_ou_409(plataforma, PLATAFORMA_EM_USO)
    return HttpResponse(status=204)

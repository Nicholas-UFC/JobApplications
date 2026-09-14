from django.http import HttpRequest, HttpResponse
from ninja import Router
from ninja.pagination import PageNumberPagination, paginate

from candidatura.models import Candidatura
from candidatura.schemas import (
    CandidaturaCreateSchema,
    CandidaturaSchema,
    CandidaturaUpdateSchema,
)
from plataforma.models import Plataforma
from utils.crud import filtrar_ativo, filtrar_busca, obter_ou_404
from utils.ordenacao import aplicar_ordenacao

router_candidatura = Router()

_CAMPO_ORDENACAO_CANDIDATURA = {
    "id": "id",
    "nome": "nome",
    "empresa": "empresa",
    "observacoes": "observacoes",
    "status": "status",
    "ativo": "ativo",
    "created_at": "created_at",
    "updated_at": "updated_at",
    "plataforma": "plataforma__nome",
}

_CAMPOS_BUSCA_CANDIDATURA = (
    "nome",
    "empresa",
    "observacoes",
    "plataforma__nome",
)


@router_candidatura.get("/", response=list[CandidaturaSchema])
@paginate(PageNumberPagination)
def listar_candidaturas(  # noqa: PLR0913, PLR0917
    request: HttpRequest,  # noqa: ARG001
    ativo: bool | None = None,
    status: str | None = None,
    plataforma_id: int | None = None,
    busca: str | None = None,
    ordenacao: str | None = None,
    **kwargs: object,  # noqa: ARG001
) -> list[Candidatura]:
    candidaturas = filtrar_ativo(
        Candidatura.objects.select_related("plataforma"), ativo
    )
    if status:
        candidaturas = candidaturas.filter(status=status)
    if plataforma_id is not None:
        candidaturas = candidaturas.filter(plataforma_id=plataforma_id)
    candidaturas = filtrar_busca(
        candidaturas, busca, _CAMPOS_BUSCA_CANDIDATURA
    )
    return aplicar_ordenacao(
        candidaturas, ordenacao, _CAMPO_ORDENACAO_CANDIDATURA
    )


@router_candidatura.get("/{candidatura_id}", response=CandidaturaSchema)
def obter_candidatura(
    request: HttpRequest,  # noqa: ARG001
    candidatura_id: int,
) -> Candidatura:
    return obter_ou_404(
        Candidatura, candidatura_id, select_related=("plataforma",)
    )


@router_candidatura.post("/", response=CandidaturaSchema)
def criar_candidatura(
    request: HttpRequest,  # noqa: ARG001
    payload: CandidaturaCreateSchema,
) -> Candidatura:
    plataforma = obter_ou_404(Plataforma, payload.plataforma_id)
    return Candidatura.objects.create(
        nome=payload.nome,
        empresa=payload.empresa,
        observacoes=payload.observacoes,
        plataforma=plataforma,
        status=payload.status,
        ativo=payload.ativo,
    )


@router_candidatura.put("/{candidatura_id}", response=CandidaturaSchema)
def atualizar_candidatura(
    request: HttpRequest,  # noqa: ARG001
    candidatura_id: int,
    payload: CandidaturaUpdateSchema,
) -> Candidatura:
    candidatura = obter_ou_404(Candidatura, candidatura_id)
    plataforma = obter_ou_404(Plataforma, payload.plataforma_id)

    candidatura.nome = payload.nome
    candidatura.empresa = payload.empresa
    candidatura.observacoes = payload.observacoes
    candidatura.plataforma = plataforma
    candidatura.status = payload.status
    candidatura.ativo = payload.ativo
    candidatura.save()
    return candidatura


@router_candidatura.delete("/{candidatura_id}", response=None)
def excluir_candidatura(
    request: HttpRequest,  # noqa: ARG001
    candidatura_id: int,
) -> HttpResponse:
    candidatura = obter_ou_404(Candidatura, candidatura_id)
    candidatura.delete()
    return HttpResponse(status=204)

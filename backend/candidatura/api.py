from django.db.models import Q, QuerySet
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError
from ninja.pagination import PageNumberPagination, paginate

from candidatura.models import Candidatura
from candidatura.schemas import (
    CandidaturaCreateSchema,
    CandidaturaSchema,
    CandidaturaUpdateSchema,
)
from plataforma.models import Plataforma
from utils.mensagens import ORDENACAO_INVALIDA

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
                ordenacao=ordenacao,
                permitidos=permitidos,
            ),
        )

    return queryset.order_by(f"-{campo}" if invertida else campo)


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
    candidaturas = Candidatura.objects.select_related("plataforma")
    if ativo is not None:
        candidaturas = candidaturas.filter(ativo=ativo)
    if status:
        candidaturas = candidaturas.filter(status=status)
    if plataforma_id is not None:
        candidaturas = candidaturas.filter(plataforma_id=plataforma_id)
    if busca:
        candidaturas = candidaturas.filter(
            Q(nome__icontains=busca)
            | Q(empresa__icontains=busca)
            | Q(observacoes__icontains=busca)
            | Q(plataforma__nome__icontains=busca)
        )
    return _aplicar_ordenacao(
        candidaturas, ordenacao, _CAMPO_ORDENACAO_CANDIDATURA
    )


@router_candidatura.get("/{candidatura_id}", response=CandidaturaSchema)
def obter_candidatura(
    request: HttpRequest,  # noqa: ARG001
    candidatura_id: int,
) -> Candidatura:
    return get_object_or_404(
        Candidatura.objects.select_related("plataforma"),
        pk=candidatura_id,
    )


@router_candidatura.post("/", response=CandidaturaSchema)
def criar_candidatura(
    request: HttpRequest,  # noqa: ARG001
    payload: CandidaturaCreateSchema,
) -> Candidatura:
    plataforma = get_object_or_404(Plataforma, pk=payload.plataforma_id)
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
    candidatura = get_object_or_404(Candidatura, pk=candidatura_id)
    plataforma = get_object_or_404(Plataforma, pk=payload.plataforma_id)

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
    candidatura = get_object_or_404(Candidatura, pk=candidatura_id)
    candidatura.delete()
    return HttpResponse(status=204)

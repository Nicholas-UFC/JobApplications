from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse
from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError
from ninja.pagination import PageNumberPagination, paginate

from empresa_monitorada.models import EmpresaMonitorada
from empresa_monitorada.schemas import (
    EmpresaMonitoradaCreateSchema,
    EmpresaMonitoradaSchema,
    EmpresaMonitoradaUpdateSchema,
)
from utils.crud import garantir_nome_unico, obter_ou_404
from utils.listagem import EspecListagem, listar
from utils.mensagens import EMPRESA_MONITORADA_NOME_DUPLICADO

router_empresa_monitorada = Router()

_ESPEC_LISTAGEM_EMPRESA_MONITORADA = EspecListagem(
    campos_busca=("nome", "url_vagas"),
    campos_ordenacao={
        "id": "id",
        "nome": "nome",
        "url_vagas": "url_vagas",
        "ultima_consulta": "ultima_consulta",
        "ativo": "ativo",
        "created_at": "created_at",
        "updated_at": "updated_at",
    },
)


@router_empresa_monitorada.get("/", response=list[EmpresaMonitoradaSchema])
@paginate(PageNumberPagination)
def listar_empresa_monitorada(
    request: HttpRequest,  # noqa: ARG001
    ativo: bool | None = None,
    busca: str | None = None,
    ordenacao: str | None = None,
    **kwargs: object,  # noqa: ARG001
) -> list[EmpresaMonitorada]:
    return listar(
        EmpresaMonitorada.objects.all(),
        _ESPEC_LISTAGEM_EMPRESA_MONITORADA,
        ativo=ativo,
        busca=busca,
        ordenacao=ordenacao,
    )


@router_empresa_monitorada.get(
    "/{empresa_monitorada_id}", response=EmpresaMonitoradaSchema
)
def obter_empresa_monitorada(
    request: HttpRequest,  # noqa: ARG001
    empresa_monitorada_id: int,
) -> EmpresaMonitorada:
    return obter_ou_404(EmpresaMonitorada, empresa_monitorada_id)


@router_empresa_monitorada.post("/", response=EmpresaMonitoradaSchema)
def criar_empresa_monitorada(
    request: HttpRequest,  # noqa: ARG001
    payload: EmpresaMonitoradaCreateSchema,
) -> EmpresaMonitorada:
    garantir_nome_unico(
        EmpresaMonitorada,
        payload.nome,
        EMPRESA_MONITORADA_NOME_DUPLICADO,
        ignorar_caixa=True,
    )
    try:
        return EmpresaMonitorada.objects.create(
            nome=payload.nome,
            url_vagas=str(payload.url_vagas),
            ativo=payload.ativo,
        )
    except IntegrityError as exc:
        raise HttpError(
            409,
            EMPRESA_MONITORADA_NOME_DUPLICADO.format(nome=payload.nome),
        ) from exc


@router_empresa_monitorada.put(
    "/{empresa_monitorada_id}", response=EmpresaMonitoradaSchema
)
def atualizar_empresa_monitorada(
    request: HttpRequest,  # noqa: ARG001
    empresa_monitorada_id: int,
    payload: EmpresaMonitoradaUpdateSchema,
) -> EmpresaMonitorada:
    empresa = obter_ou_404(EmpresaMonitorada, empresa_monitorada_id)
    garantir_nome_unico(
        EmpresaMonitorada,
        payload.nome,
        EMPRESA_MONITORADA_NOME_DUPLICADO,
        excluir_pk=empresa_monitorada_id,
        ignorar_caixa=True,
    )
    empresa.nome = payload.nome
    empresa.url_vagas = str(payload.url_vagas)
    empresa.ativo = payload.ativo
    try:
        empresa.save()
    except IntegrityError as exc:
        raise HttpError(
            409,
            EMPRESA_MONITORADA_NOME_DUPLICADO.format(nome=payload.nome),
        ) from exc
    return empresa


@router_empresa_monitorada.post(
    "/{empresa_monitorada_id}/consultar",
    response=EmpresaMonitoradaSchema,
)
def consultar_empresa_monitorada(
    request: HttpRequest,  # noqa: ARG001
    empresa_monitorada_id: int,
) -> EmpresaMonitorada:
    empresa = obter_ou_404(EmpresaMonitorada, empresa_monitorada_id)
    empresa.ultima_consulta = timezone.now()
    empresa.save(update_fields=["ultima_consulta", "updated_at"])
    return empresa


@router_empresa_monitorada.delete("/{empresa_monitorada_id}", response=None)
def excluir_empresa_monitorada(
    request: HttpRequest,  # noqa: ARG001
    empresa_monitorada_id: int,
) -> HttpResponse:
    empresa = obter_ou_404(EmpresaMonitorada, empresa_monitorada_id)
    empresa.delete()
    return HttpResponse(status=204)

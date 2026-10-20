from datetime import UTC, datetime, timedelta

import pytest
from django.db import IntegrityError
from django.utils import timezone
from ninja.testing import TestClient

from empresa_monitorada.api import router_empresa_monitorada
from empresa_monitorada.models import (
    ULTIMA_CONSULTA_VAZIA,
    EmpresaMonitorada,
)

pytestmark = pytest.mark.django_db

URL_VAGAS = "https://acme.example/vagas"


@pytest.fixture()
def cliente() -> TestClient:
    return TestClient(router_empresa_monitorada)


@pytest.fixture()
def empresa() -> EmpresaMonitorada:
    return EmpresaMonitorada.objects.create(
        nome="Acme",
        url_vagas=URL_VAGAS,
    )


def test_criar_empresa_grava_sentinel(
    cliente: TestClient,
) -> None:
    resposta = cliente.post(
        "/",
        json={"nome": "Acme", "url_vagas": URL_VAGAS},
    )

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["nome"] == "Acme"
    assert corpo["url_vagas"] == URL_VAGAS
    assert datetime.fromisoformat(corpo["ultima_consulta"]) == (
        ULTIMA_CONSULTA_VAZIA
    )


def test_criar_empresa_ignora_ultima_consulta_enviada(
    cliente: TestClient,
) -> None:
    resposta = cliente.post(
        "/",
        json={
            "nome": "Acme",
            "url_vagas": URL_VAGAS,
            "ultima_consulta": "2020-01-01T00:00:00Z",
        },
    )

    assert resposta.status_code == 200
    assert (
        datetime.fromisoformat(resposta.json()["ultima_consulta"])
        == ULTIMA_CONSULTA_VAZIA
    )


@pytest.mark.parametrize("nome", ["Acme", "ACME", "acme"])
def test_criar_empresa_com_nome_duplicado_retorna_409(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
    nome: str,
) -> None:
    resposta = cliente.post(
        "/",
        json={"nome": nome, "url_vagas": "https://outra.example/vagas"},
    )

    assert resposta.status_code == 409
    assert resposta.json()["detail"] == (
        f"Já existe uma Empresa monitorada com o nome '{nome}'."
    )


def test_criar_empresa_com_url_invalida_retorna_422(
    cliente: TestClient,
) -> None:
    resposta = cliente.post(
        "/",
        json={"nome": "Acme", "url_vagas": "nao-e-url"},
    )

    assert resposta.status_code == 422


def test_criar_empresa_com_nome_duplicado_no_banco_retorna_409(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    outra = EmpresaMonitorada(nome="ACME", url_vagas=URL_VAGAS)
    with pytest.raises(IntegrityError):
        outra.save()


def test_listar_empresas_paginado(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    EmpresaMonitorada.objects.create(
        nome="Beta",
        url_vagas="https://beta.example/vagas",
    )

    resposta = cliente.get("/")

    assert resposta.status_code == 200
    assert resposta.json()["count"] == 2


def test_listar_empresas_com_busca_em_nome_e_url(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    EmpresaMonitorada.objects.create(
        nome="Beta",
        url_vagas="https://beta.example/vagas",
    )

    por_nome = cliente.get("/?busca=acme")
    por_url = cliente.get("/?busca=beta.example")

    assert por_nome.json()["count"] == 1
    assert por_url.json()["count"] == 1


def test_listar_empresas_filtra_ativo(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    EmpresaMonitorada.objects.create(
        nome="Beta",
        url_vagas="https://beta.example/vagas",
        ativo=False,
    )

    resposta = cliente.get("/?ativo=true")

    assert resposta.json()["count"] == 1


def test_listar_empresas_ordenacao_invalida_retorna_400(
    cliente: TestClient,
) -> None:
    resposta = cliente.get("/?ordenacao=inexistente")

    assert resposta.status_code == 400


def test_listar_empresas_ordena_nunca_consultadas_primeiro(
    cliente: TestClient,
) -> None:
    recente = EmpresaMonitorada.objects.create(
        nome="Recente",
        url_vagas=URL_VAGAS,
        ultima_consulta=datetime(2024, 6, 1, tzinfo=UTC),
    )
    antiga = EmpresaMonitorada.objects.create(
        nome="Antiga",
        url_vagas=URL_VAGAS,
        ultima_consulta=datetime(2020, 1, 1, tzinfo=UTC),
    )
    nunca = EmpresaMonitorada.objects.create(
        nome="Nunca",
        url_vagas=URL_VAGAS,
    )

    resposta = cliente.get("/")

    nomes = [item["nome"] for item in resposta.json()["items"]]
    assert nomes == [nunca.nome, antiga.nome, recente.nome]


def test_obter_empresa(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    resposta = cliente.get(f"/{empresa.pk}")

    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "Acme"


def test_obter_empresa_inexistente_retorna_404(
    cliente: TestClient,
) -> None:
    resposta = cliente.get("/9999")

    assert resposta.status_code == 404


def test_atualizar_empresa_preserva_ultima_consulta(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    resposta = cliente.put(
        f"/{empresa.pk}",
        json={
            "nome": "Acme Renomeada",
            "url_vagas": "https://acme.example/novas-vagas",
            "ativo": False,
        },
    )

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["nome"] == "Acme Renomeada"
    assert corpo["url_vagas"] == "https://acme.example/novas-vagas"
    assert corpo["ativo"] is False
    assert datetime.fromisoformat(corpo["ultima_consulta"]) == (
        ULTIMA_CONSULTA_VAZIA
    )


def test_atualizar_empresa_com_nome_de_outra_retorna_409(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    outra = EmpresaMonitorada.objects.create(
        nome="Beta",
        url_vagas="https://beta.example/vagas",
    )

    resposta = cliente.put(
        f"/{empresa.pk}",
        json={
            "nome": outra.nome,
            "url_vagas": URL_VAGAS,
            "ativo": True,
        },
    )

    assert resposta.status_code == 409


def test_atualizar_empresa_com_o_proprio_nome_e_permitido(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    resposta = cliente.put(
        f"/{empresa.pk}",
        json={
            "nome": "ACME",
            "url_vagas": URL_VAGAS,
            "ativo": True,
        },
    )

    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "ACME"


def test_consultar_empresa_grava_data_atual(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    resposta = cliente.post(f"/{empresa.pk}/consultar")

    assert resposta.status_code == 200
    data = datetime.fromisoformat(resposta.json()["ultima_consulta"])
    assert data > ULTIMA_CONSULTA_VAZIA
    assert timezone.now() - data < timedelta(seconds=5)


def test_consultar_empresa_inexistente_retorna_404(
    cliente: TestClient,
) -> None:
    resposta = cliente.post("/9999/consultar")

    assert resposta.status_code == 404


def test_excluir_empresa(
    cliente: TestClient,
    empresa: EmpresaMonitorada,
) -> None:
    resposta = cliente.delete(f"/{empresa.pk}")

    assert resposta.status_code == 204
    assert not EmpresaMonitorada.objects.filter(pk=empresa.pk).exists()


def test_excluir_empresa_inexistente_retorna_404(
    cliente: TestClient,
) -> None:
    resposta = cliente.delete("/9999")

    assert resposta.status_code == 404

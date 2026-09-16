"""Listagem pelo seam ligado: routers reais via TestClient."""

import pytest
from ninja.testing import TestClient

from candidatura.api import router_candidatura
from candidatura.models import Candidatura
from plataforma.api import router_plataforma
from plataforma.models import Plataforma

pytestmark = pytest.mark.django_db


@pytest.fixture()
def cliente_plataforma() -> TestClient:
    return TestClient(router_plataforma)


@pytest.fixture()
def cliente_candidatura() -> TestClient:
    return TestClient(router_candidatura)


@pytest.fixture()
def plataformas() -> tuple[Plataforma, Plataforma]:
    return (
        Plataforma.objects.create(nome="LinkedIn"),
        Plataforma.objects.create(nome="Gupy", ativo=False),
    )


def test_listar_plataformas_paginado(
    cliente_plataforma: TestClient, plataformas: tuple
) -> None:
    resposta = cliente_plataforma.get("/")
    assert resposta.status_code == 200
    assert resposta.json()["count"] == 2


def test_listar_plataformas_com_busca(
    cliente_plataforma: TestClient, plataformas: tuple
) -> None:
    resposta = cliente_plataforma.get("/?busca=link")
    assert resposta.status_code == 200
    assert resposta.json()["count"] == 1


def test_listar_plataformas_filtra_ativo(
    cliente_plataforma: TestClient, plataformas: tuple
) -> None:
    resposta = cliente_plataforma.get("/?ativo=true")
    assert resposta.status_code == 200
    assert resposta.json()["count"] == 1


def test_listar_plataformas_ordenacao_invalida_retorna_400(
    cliente_plataforma: TestClient, plataformas: tuple
) -> None:
    resposta = cliente_plataforma.get("/?ordenacao=inexistente")
    assert resposta.status_code == 400


def test_listar_candidaturas_com_filtros(
    cliente_candidatura: TestClient, plataformas: tuple
) -> None:
    linkedin, _ = plataformas
    Candidatura.objects.create(nome="Dev", empresa="Acme", plataforma=linkedin)
    resposta = cliente_candidatura.get("/?status=ENVIADO")
    assert resposta.status_code == 200
    assert resposta.json()["count"] == 1

    resposta = cliente_candidatura.get(f"/?plataforma_id={linkedin.pk}")
    assert resposta.status_code == 200
    assert resposta.json()["count"] == 1


def test_listar_candidaturas_com_busca_na_plataforma(
    cliente_candidatura: TestClient, plataformas: tuple
) -> None:
    linkedin, _ = plataformas
    Candidatura.objects.create(nome="Dev", empresa="Acme", plataforma=linkedin)
    resposta = cliente_candidatura.get("/?busca=linkedin")
    assert resposta.status_code == 200
    assert resposta.json()["count"] == 1


def test_obter_candidatura_inexistente_retorna_404(
    cliente_candidatura: TestClient,
) -> None:
    resposta = cliente_candidatura.get("/9999")
    assert resposta.status_code == 404

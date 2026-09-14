import pytest
from django.http import Http404
from ninja.errors import HttpError

from candidatura.models import Candidatura
from plataforma.models import Plataforma
from utils.crud import (
    excluir_ou_409,
    filtrar_ativo,
    filtrar_busca,
    garantir_nome_unico,
    obter_ou_404,
)

pytestmark = pytest.mark.django_db


def test_obter_ou_404_retorna_objeto() -> None:
    plataforma = Plataforma.objects.create(nome="LinkedIn")
    assert obter_ou_404(Plataforma, plataforma.pk) == plataforma


def test_obter_ou_404_inexistente_levanta_404() -> None:
    with pytest.raises(Http404):
        obter_ou_404(Plataforma, 9999)


def test_filtrar_ativo() -> None:
    Plataforma.objects.create(nome="Ativa", ativo=True)
    Plataforma.objects.create(nome="Inativa", ativo=False)
    assert filtrar_ativo(Plataforma.objects.all(), None).count() == 2
    assert filtrar_ativo(Plataforma.objects.all(), True).count() == 1


def test_filtrar_busca() -> None:
    Plataforma.objects.create(nome="LinkedIn")
    Plataforma.objects.create(nome="Gupy")
    encontrados = filtrar_busca(Plataforma.objects.all(), "link", ("nome",))
    assert encontrados.count() == 1
    assert (
        filtrar_busca(Plataforma.objects.all(), None, ("nome",)).count() == 2
    )


def test_garantir_nome_unico_quando_livre() -> None:
    garantir_nome_unico(Plataforma, "LinkedIn", "dup {nome}")


def test_garantir_nome_unico_levanta_409() -> None:
    Plataforma.objects.create(nome="LinkedIn")
    with pytest.raises(HttpError) as excinfo:
        garantir_nome_unico(Plataforma, "LinkedIn", "dup {nome}")
    assert excinfo.value.status_code == 409


def test_garantir_nome_unico_ignora_proprio_pk() -> None:
    plataforma = Plataforma.objects.create(nome="LinkedIn")
    garantir_nome_unico(
        Plataforma, "LinkedIn", "dup {nome}", excluir_pk=plataforma.pk
    )


def test_excluir_ou_409() -> None:
    plataforma = Plataforma.objects.create(nome="LinkedIn")
    excluir_ou_409(plataforma, "em uso {nome}")
    assert not Plataforma.objects.filter(pk=plataforma.pk).exists()


def test_excluir_ou_409_com_vinculo_protegido() -> None:
    plataforma = Plataforma.objects.create(nome="LinkedIn")
    Candidatura.objects.create(
        nome="Vaga", empresa="Acme", plataforma=plataforma
    )
    with pytest.raises(HttpError) as excinfo:
        excluir_ou_409(plataforma, "em uso {nome}")
    assert excinfo.value.status_code == 409

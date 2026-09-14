import pytest
from ninja.errors import HttpError

from plataforma.models import Plataforma
from utils.ordenacao import aplicar_ordenacao

_CAMPOS = {"id": "id", "nome": "nome", "apelido": "nome"}


def test_sem_ordenacao_mantem_queryset() -> None:
    queryset = Plataforma.objects.all()
    assert aplicar_ordenacao(queryset, None, _CAMPOS) is queryset


def test_ordenacao_ascendente() -> None:
    ordenado = aplicar_ordenacao(Plataforma.objects.all(), "nome", _CAMPOS)
    assert ordenado.query.order_by == ("nome",)


def test_ordenacao_descendente() -> None:
    ordenado = aplicar_ordenacao(Plataforma.objects.all(), "-nome", _CAMPOS)
    assert ordenado.query.order_by == ("-nome",)


def test_ordenacao_usa_mapeamento_do_campo() -> None:
    ordenado = aplicar_ordenacao(Plataforma.objects.all(), "apelido", _CAMPOS)
    assert ordenado.query.order_by == ("nome",)


def test_ordenacao_invalida_retorna_400() -> None:
    with pytest.raises(HttpError) as excinfo:
        aplicar_ordenacao(Plataforma.objects.all(), "inexistente", _CAMPOS)
    assert excinfo.value.status_code == 400

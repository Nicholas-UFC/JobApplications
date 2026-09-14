from ninja import Schema


class BaseSchema(Schema):
    """Leitura."""

    id: int
    nome: str
    ativo: bool = True


class BaseCreateSchema(Schema):
    """Criação."""

    nome: str
    ativo: bool = True


class BaseUpdateSchema(BaseCreateSchema):
    """Atualização."""


class ErroSchema(Schema):
    """Contrato de erro da API: {"detail": "mensagem"}."""

    detail: str

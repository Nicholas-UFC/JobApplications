from utils.baseschemas import BaseCreateSchema, BaseSchema, BaseUpdateSchema


class PlataformaSchema(BaseSchema):
    """Leitura de Plataforma."""

    site_url: str


class PlataformaCreateSchema(BaseCreateSchema):
    """Criação de Plataforma."""

    site_url: str = ""


class PlataformaUpdateSchema(BaseUpdateSchema):
    """Atualização de Plataforma."""

    site_url: str = ""

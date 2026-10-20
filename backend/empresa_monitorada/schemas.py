from datetime import datetime

from pydantic import HttpUrl

from utils.baseschemas import BaseCreateSchema, BaseSchema, BaseUpdateSchema


class EmpresaMonitoradaSchema(BaseSchema):
    """Leitura de EmpresaMonitorada."""

    url_vagas: str
    ultima_consulta: datetime


class EmpresaMonitoradaCreateSchema(BaseCreateSchema):
    """Criação de EmpresaMonitorada."""

    url_vagas: HttpUrl


class EmpresaMonitoradaUpdateSchema(BaseUpdateSchema):
    """Atualização de EmpresaMonitorada."""

    url_vagas: HttpUrl

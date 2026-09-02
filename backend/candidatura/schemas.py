from candidatura.models import Candidatura
from utils.baseschemas import BaseCreateSchema, BaseSchema


class CandidaturaSchema(BaseSchema):
    """Leitura de Candidatura"""

    empresa: str
    observacoes: str
    plataforma_id: int
    status: Candidatura.StatusChoices


class CandidaturaCreateSchema(BaseCreateSchema):
    """Criação de Candidatura"""

    empresa: str
    observacoes: str
    plataforma_id: int
    status: Candidatura.StatusChoices


class CandidaturaUpdateSchema(CandidaturaCreateSchema):
    """Atualização de Candidatura"""

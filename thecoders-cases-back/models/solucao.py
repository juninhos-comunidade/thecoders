from pydantic import BaseModel, Field
from uuid import UUID


class SolucaoPayload(BaseModel):
    usuario_id: UUID
    case_id: UUID
    sala_id: UUID
    solucao_enviada: str = Field(..., min_length=1, max_length=10000)
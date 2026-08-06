from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class AvaliacaoPayload(BaseModel):
    usuario_id: UUID
    case_id: UUID
    sala_id: UUID
    solucao_enviada: Optional[str] = Field(default=None, max_length=10000)
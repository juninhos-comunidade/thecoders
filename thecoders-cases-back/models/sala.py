from pydantic import BaseModel
from uuid import UUID


class SalaPayload(BaseModel):
    case_id: UUID
    usuario_id: UUID
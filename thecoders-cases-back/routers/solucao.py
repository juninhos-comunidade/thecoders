from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase
from models.solucao import SolucaoPayload

router = APIRouter(prefix="/solucao", tags=["solucao"])


def _existe(tabela: str, id_valor: str) -> bool:
    resposta = supabase.table(tabela).select("id").eq("id", id_valor).limit(1).execute()
    return len(resposta.data) > 0


@router.post("")
def receber_solucao(payload: SolucaoPayload):
    # Pydantic já validou os tipos (UUIDs válidos, string não vazia).
    # Agora valida se as referências realmente existem no banco.
    if not _existe("usuarios", str(payload.usuario_id)):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not _existe("cases", str(payload.case_id)):
        raise HTTPException(status_code=404, detail="Case não encontrado")

    if not _existe("salas", str(payload.sala_id)):
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return {
        "status": "validado",
        "usuario_id": payload.usuario_id,
        "case_id": payload.case_id,
        "sala_id": payload.sala_id,
        "solucao_enviada": payload.solucao_enviada,
    }
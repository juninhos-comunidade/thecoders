from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase
from models.sala import SalaPayload

router = APIRouter(prefix="/salas", tags=["salas"])


@router.post("")
def criar_sala(payload: SalaPayload):
    """
    Cria uma sala para o usuário resolver um case.

    A tabela `salas` não guarda usuario_id nem numero_participantes (schema
    atual: id, case_id, nivel_expertise, nivel_dificuldade, criado_em) — uma
    sala representa "case + nível", não um usuário específico. O usuario_id
    no payload serve só para buscarmos o nivel_expertise dele.

    Fix rápido enquanto o multiplayer real não existe: cada chamada cria uma
    sala nova, só para satisfazer a FK obrigatória sala_id usada em
    /avaliacao e na tabela `resultados`. Quando o multiplayer for
    implementado, este endpoint deve evoluir para reaproveitar salas
    existentes do mesmo case/nível (ou ser substituído pelo fluxo de
    socket.io que cria/junta salas em tempo real).
    """
    case_resp = (
        supabase.table("cases")
        .select("id, nivel_dificuldade")
        .eq("id", str(payload.case_id))
        .limit(1)
        .execute()
    )
    if not case_resp.data:
        raise HTTPException(status_code=404, detail="Case não encontrado")

    usuario_resp = (
        supabase.table("usuarios")
        .select("id, nivel_expertise")
        .eq("id", str(payload.usuario_id))
        .limit(1)
        .execute()
    )
    if not usuario_resp.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    case = case_resp.data[0]
    usuario = usuario_resp.data[0]

    sala_resp = (
        supabase.table("salas")
        .insert({
            "case_id": str(payload.case_id),
            "nivel_expertise": usuario["nivel_expertise"],
            "nivel_dificuldade": case["nivel_dificuldade"],
        })
        .execute()
    )

    if not sala_resp.data:
        raise HTTPException(status_code=400, detail="Não foi possível criar a sala")

    sala_id = sala_resp.data[0]["id"]

    return {"id": sala_id}
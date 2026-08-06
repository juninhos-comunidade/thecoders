from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase
from models.avaliacao import AvaliacaoPayload

router = APIRouter(prefix="/avaliacao", tags=["avaliacao"])

XP_POR_CASE_APROVADO = 10


@router.post("")
def avaliar_solucao(payload: AvaliacaoPayload):
    enviou_solucao = bool(payload.solucao_enviada and payload.solucao_enviada.strip())

    if not enviou_solucao:
        return {
            "status": "nao_enviado",
            "aprovado": False,
            "redirecionar": "lobby",
        }

    usuario_resp = (
        supabase.table("usuarios")
        .select("id, xp")
        .eq("id", str(payload.usuario_id))
        .limit(1)
        .execute()
    )
    if not usuario_resp.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    xp_atual = usuario_resp.data[0]["xp"]
    novo_xp = xp_atual + XP_POR_CASE_APROVADO

    try:
        supabase.table("resultados").insert({
            "usuario_id": str(payload.usuario_id),
            "case_id": str(payload.case_id),
            "sala_id": str(payload.sala_id),
            "solucao_enviada": payload.solucao_enviada,
            "aprovado": True,
            "feedback_simulado": "Solução recebida com sucesso.",
        }).execute()
    except Exception as erro:
        raise HTTPException(
            status_code=400,
            detail=(
                "Não foi possível registrar o resultado. Verifique se "
                f"case_id e sala_id existem no banco. Detalhe: {erro}"
            ),
        )

    supabase.table("usuarios").update({"xp": novo_xp}).eq(
        "id", str(payload.usuario_id)
    ).execute()

    return {
        "status": "avaliado",
        "aprovado": True,
        "xp_ganho": XP_POR_CASE_APROVADO,
        "xp_total": novo_xp,
    }
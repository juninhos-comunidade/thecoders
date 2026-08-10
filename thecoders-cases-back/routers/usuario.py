from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.patch("/{usuario_id}/tutorial-visto")
def marcar_tutorial_visto(usuario_id: str):
    resposta = (
        supabase.table("usuarios")
        .update({"primeiro_login": False})
        .eq("id", usuario_id)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return {"id": usuario_id, "primeiro_login": False}
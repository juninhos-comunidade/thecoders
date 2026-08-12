from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/{usuario_id}/perfil")
def obter_perfil_usuario(usuario_id: str):
    resposta = (
        supabase.table("usuarios")
        .select("id, nome_completo, nivel_expertise, xp, primeiro_login")
        .eq("id", usuario_id)
        .limit(1)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario = resposta.data[0]
    return {
        "id": usuario["id"],
        "nome_completo": usuario["nome_completo"],
        "nivel_expertise": usuario["nivel_expertise"],
        "xp": usuario["xp"],
        "primeiro_login": usuario["primeiro_login"],
    }


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
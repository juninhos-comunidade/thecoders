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

@router.get("/{usuario_id}/resultados")
def obter_resultados_usuario(usuario_id: str):
    resposta = (
        supabase.table("resultados")
        .select("*")
        .eq("usuario_id", usuario_id)
        .order("criado_em", desc=True)
        .execute()
    )

    concluidos = [linha for linha in resposta.data if linha["nivel_alcancado"] is not None]
    total_concluidos = len(concluidos)
    ultimo_resultado = concluidos[0] if resposta.data else None

    return {
        "total_concluidos": total_concluidos,
        "ultimo_resultado": ultimo_resultado,
    }
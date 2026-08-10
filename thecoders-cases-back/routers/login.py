import bcrypt
from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase
from models.login import LoginPayload

router = APIRouter(prefix="/login", tags=["login"])


@router.post("")
def autenticar(payload: LoginPayload):
    usuario_resp = (
        supabase.table("usuarios")
        .select("id, nome_completo, email, senha_hash, primeiro_login, nivel_expertise, xp")
        .eq("email", payload.email)
        .limit(1)
        .execute()
    )

    if not usuario_resp.data:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    usuario = usuario_resp.data[0]

    senha_confere = bcrypt.checkpw(
        payload.senha.encode("utf-8"),
        usuario["senha_hash"].encode("utf-8"),
    )

    if not senha_confere:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    return {
        "id": usuario["id"],
        "nome_completo": usuario["nome_completo"],
        "email": usuario["email"],
        "primeiro_login": usuario["primeiro_login"],
        "nivel_expertise": usuario["nivel_expertise"],
        "xp": usuario["xp"],
    }
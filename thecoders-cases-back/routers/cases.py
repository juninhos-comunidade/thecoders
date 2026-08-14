import random
import unicodedata

from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase

router = APIRouter(prefix="/cases", tags=["cases"])


def _remover_acentos(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto)
        if unicodedata.category(c) != "Mn"
    )


def _mapear_dificuldades_por_nivel(nivel_usuario: str | None):
    nivel = _remover_acentos((nivel_usuario or "ESTAGIARIO").strip().upper())

    mapa = {
        "ESTAGIARIO": ["FACIL"],
        "JUNIOR": ["MEDIO"],
        "SENIOR": ["MEDIO", "DIFICIL"],
    }

    return mapa.get(nivel, ["FACIL"])


def _normalizar_case(raw_case: dict) -> dict:
    return {
        "id": raw_case.get("id"),
        "titulo": raw_case.get("titulo") or raw_case.get("title") or "Case sem título",
        "descricao": raw_case.get("descricao") or raw_case.get("description") or "Sem descrição disponível.",
        "nivel_dificuldade": raw_case.get("nivel_dificuldade") or raw_case.get("dificulty") or "FACIL",
        "tempo_minimo_busca": raw_case.get("tempo_minimo_busca") or raw_case.get("timeLimit") or 18,
    }


@router.get("")
def listar_cases():
    resposta = (
        supabase.table("cases")
        .select("id, titulo, descricao, nivel_dificuldade, tempo_minimo_busca")
        .order("criado_em", desc=False)
        .execute()
    )

    return {"cases": [_normalizar_case(item) for item in resposta.data]}


@router.get("/aleatorio")
def obter_case_aleatorio(usuario_id: str | None = None, nivel_usuario: str | None = None):
    nivel = nivel_usuario

    if usuario_id:
        usuario_resp = (
            supabase.table("usuarios")
            .select("nivel_expertise")
            .eq("id", usuario_id)
            .limit(1)
            .execute()
        )

        if usuario_resp.data:
            nivel = usuario_resp.data[0].get("nivel_expertise")

    dificuldades_permitidas = _mapear_dificuldades_por_nivel(nivel)

    resposta = (
        supabase.table("cases")
        .select("id, titulo, descricao, nivel_dificuldade, tempo_minimo_busca")
        .in_("nivel_dificuldade", dificuldades_permitidas)
        .execute()
    )

    if not resposta.data:
        resposta = supabase.table("cases").select("id, titulo, descricao, nivel_dificuldade, tempo_minimo_busca").execute()

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Nenhum case disponível")

    case_aleatorio = random.choice(resposta.data)
    return _normalizar_case(case_aleatorio)


@router.get("/{case_id}")
def obter_case(case_id: str):
    resposta = (
        supabase.table("cases")
        .select("id, titulo, descricao, nivel_dificuldade, tempo_minimo_busca")
        .eq("id", case_id)
        .limit(1)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Case não encontrado")

    return _normalizar_case(resposta.data[0])
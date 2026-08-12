from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase

router = APIRouter(prefix="/cases", tags=["cases"])


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

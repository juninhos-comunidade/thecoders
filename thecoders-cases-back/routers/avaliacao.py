from fastapi import APIRouter, HTTPException

from database.supabase_client import supabase
from models.avaliacao import AvaliacaoPayload
from services.avaliacao_ia import (
    AvaliacaoIAIndisponivel,
    avaliar_solucao_ia,
    montar_feedback_texto,
    CATEGORIAS_AVALIACAO,
    MEDIA_MINIMA_APROVACAO,
)

router = APIRouter(prefix="/avaliacao", tags=["avaliacao"])

XP_POR_CASE_APROVADO = 10
FEEDBACK_IA_INDISPONIVEL = (
    "Não foi possível avaliar sua solução com a IA no momento. "
    "Sua solução foi registrada e será revisada em breve."
)

# categoria (snake_case, usado no serviço de IA e nas colunas nota_<categoria>)
# -> chave camelCase esperada pelo componente Score do frontend
CATEGORIA_PARA_CAMEL_CASE = {
    "raciocinio_logico": "raciocinioLogico",
    "qualidade_tecnica": "qualidadeTecnica",
    "resolucao_problemas": "resolucaoProblemas",
    "comunicacao": "comunicacao",
    "priorizacao": "priorizacao",
    "colaboracao": "colaboracao",
}


def _formatar_nota_categoria(valor: float) -> str:
    """Formata 9.0 como '9,0', no padrão esperado pelo componente Score (decimal com vírgula)."""
    return f"{valor:.1f}".replace(".", ",")


@router.post("")
async def avaliar_solucao(payload: AvaliacaoPayload):
    enviou_solucao = bool(payload.solucao_enviada and payload.solucao_enviada.strip())

    if not enviou_solucao:
        return {
            "status": "nao_enviado",
            "aprovado": False,
            "redirecionar": "lobby",
        }

    usuario_resp = (
        supabase.table("usuarios")
        .select("id, xp, nivel_expertise")
        .eq("id", str(payload.usuario_id))
        .limit(1)
        .execute()
    )
    if not usuario_resp.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    case_resp = (
        supabase.table("cases")
        .select("id, titulo, descricao")
        .eq("id", str(payload.case_id))
        .limit(1)
        .execute()
    )
    if not case_resp.data:
        raise HTTPException(status_code=404, detail="Case não encontrado")

    usuario = usuario_resp.data[0]
    case = case_resp.data[0]

    try:
        avaliacao = await avaliar_solucao_ia(
            case_titulo=case["titulo"],
            case_descricao=case["descricao"],
            nivel_expertise=usuario["nivel_expertise"],
            solucao_texto=payload.solucao_enviada,
        )
        nota_media = avaliacao["nota_media"]
        aprovado = nota_media > MEDIA_MINIMA_APROVACAO
        feedback_texto = montar_feedback_texto(avaliacao)
        notas_categorias = avaliacao["notas_categorias"]
    except AvaliacaoIAIndisponivel:
        # Fallback: não trava o fluxo do participante se a Groq falhar.
        # A solução fica registrada e aprovada por padrão, sinalizando que
        # a avaliação da IA não pôde ser concluída.
        nota_media = None
        aprovado = False
        feedback_texto = FEEDBACK_IA_INDISPONIVEL
        notas_categorias = {categoria: None for categoria in CATEGORIAS_AVALIACAO}

    xp_atual = usuario["xp"]
    xp_ganho = XP_POR_CASE_APROVADO if aprovado else 0
    novo_xp = xp_atual + xp_ganho

    try:
        supabase.table("resultados").insert({
            "usuario_id": str(payload.usuario_id),
            "case_id": str(payload.case_id),
            "sala_id": str(payload.sala_id),
            "solucao_enviada": payload.solucao_enviada,
            "nivel_alcancado": nota_media,
            "aprovado": aprovado,
            "feedback_simulado": feedback_texto,
            **{f"nota_{categoria}": notas_categorias[categoria] for categoria in CATEGORIAS_AVALIACAO},
        }).execute()
    except Exception as erro:
        raise HTTPException(
            status_code=400,
            detail=(
                "Não foi possível registrar o resultado. Verifique se "
                f"case_id e sala_id existem no banco. Detalhe: {erro}"
            ),
        )

    if xp_ganho:
        supabase.table("usuarios").update({"xp": novo_xp}).eq(
            "id", str(payload.usuario_id)
        ).execute()

    return {
        "status": "avaliado",
        "aprovado": aprovado,
        "nota_media": nota_media,
        "feedback": feedback_texto,
        "notas_categorias": {
            CATEGORIA_PARA_CAMEL_CASE[categoria]: (
                _formatar_nota_categoria(valor) if valor is not None else None
            )
            for categoria, valor in notas_categorias.items()
        },
        "xp_ganho": xp_ganho,
        "xp_total": novo_xp,
    }
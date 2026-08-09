import json
import os

import httpx

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

MEDIA_MINIMA_APROVACAO = 7  # escala 0-10, mesma das 6 categorias. Aprovado se média > 7.

# Chaves usadas tanto no JSON pedido à IA quanto nas colunas de resultados no Supabase
# (nota_<categoria>). Mantidas em snake_case aqui; a conversão para camelCase
# (formato usado pelo componente Score do frontend) fica a cargo de quem consumir o retorno.
CATEGORIAS_AVALIACAO = (
    "raciocinio_logico",
    "qualidade_tecnica",
    "resolucao_problemas",
    "comunicacao",
    "priorizacao",
    "colaboracao",
)


class AvaliacaoIAIndisponivel(Exception):
    """Levantada quando a Groq API falha, dá timeout ou retorna algo não parseável."""


def _montar_prompt(case_titulo: str, case_descricao: str, nivel_expertise: str, solucao_texto: str) -> str:
    return f"""Você é um avaliador técnico de soluções de cases de TI para candidatos em processo seletivo, nível {nivel_expertise}.

CASE: {case_titulo}
DESCRIÇÃO DO CASE:
{case_descricao}

SOLUÇÃO ENVIADA PELO CANDIDATO:
{solucao_texto}

Avalie a solução em cada uma destas 6 categorias, com uma nota de 0.0 a 10.0 (uma casa decimal) para cada, considerando clareza do raciocínio, adequação técnica ao nível do candidato, completude em relação ao que o case pede, e criatividade:
- raciocinio_logico: clareza e coerência do raciocínio para chegar à solução
- qualidade_tecnica: adequação técnica da solução ao nível do candidato
- resolucao_problemas: capacidade de identificar a causa raiz e propor uma solução efetiva
- comunicacao: clareza e objetividade na forma como a solução foi escrita/explicada
- priorizacao: capacidade de identificar o que era mais importante resolver primeiro
- colaboracao: indícios de disposição para alinhar/validar a solução com o time (quando aplicável ao case)

Responda APENAS com um JSON válido, sem markdown e sem texto fora do JSON, no formato exato:
{{"pontos_fortes": ["...", "..."], "pontos_melhoria": ["...", "..."], "feedback_geral": "...", "notas_categorias": {{"raciocinio_logico": <0.0-10.0>, "qualidade_tecnica": <0.0-10.0>, "resolucao_problemas": <0.0-10.0>, "comunicacao": <0.0-10.0>, "priorizacao": <0.0-10.0>, "colaboracao": <0.0-10.0>}}}}
"""


async def avaliar_solucao_ia(
    case_titulo: str,
    case_descricao: str,
    nivel_expertise: str,
    solucao_texto: str,
) -> dict:
    """
    Chama a Groq API para avaliar uma solução de case nas 6 categorias definidas.
    Retorna dict com: nota_media (float, média das 6 categorias), pontos_fortes (list[str]),
    pontos_melhoria (list[str]), feedback_geral (str), notas_categorias (dict[str, float]).
    Levanta AvaliacaoIAIndisponivel se a Groq falhar, der timeout ou responder algo não parseável.
    """
    if not GROQ_API_KEY:
        raise AvaliacaoIAIndisponivel("GROQ_API_KEY não configurada no ambiente.")

    prompt = _montar_prompt(case_titulo, case_descricao, nivel_expertise, solucao_texto)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resposta = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"},
                },
            )
            resposta.raise_for_status()
    except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as erro:
        raise AvaliacaoIAIndisponivel(f"Falha ao chamar a Groq API: {erro}") from erro

    try:
        conteudo = resposta.json()["choices"][0]["message"]["content"]
        avaliacao = json.loads(conteudo)
    except (KeyError, IndexError, json.JSONDecodeError) as erro:
        raise AvaliacaoIAIndisponivel(f"Resposta da Groq não pôde ser interpretada: {erro}") from erro

    notas_categorias_raw = avaliacao.get("notas_categorias") or {}
    if not isinstance(notas_categorias_raw, dict):
        raise AvaliacaoIAIndisponivel(f"notas_categorias retornado pela IA não é um objeto: {notas_categorias_raw!r}")

    notas_categorias = {}
    for categoria in CATEGORIAS_AVALIACAO:
        valor = notas_categorias_raw.get(categoria)
        if not isinstance(valor, (int, float)) or not (0 <= valor <= 10):
            raise AvaliacaoIAIndisponivel(
                f"Nota da categoria '{categoria}' retornada pela IA é inválida: {valor!r}"
            )
        notas_categorias[categoria] = round(float(valor), 1)

    # Nota geral = média aritmética das 6 categorias, calculada aqui (não pedida à IA),
    # para garantir que ela sempre seja consistente com as notas individuais.
    nota_media = round(sum(notas_categorias.values()) / len(CATEGORIAS_AVALIACAO), 1)

    return {
        "nota_media": nota_media,
        "pontos_fortes": avaliacao.get("pontos_fortes", []),
        "pontos_melhoria": avaliacao.get("pontos_melhoria", []),
        "feedback_geral": avaliacao.get("feedback_geral", ""),
        "notas_categorias": notas_categorias,
    }


def montar_feedback_texto(avaliacao: dict) -> str:
    """Formata o resultado estruturado da IA em um texto único para a coluna feedback_simulado."""
    partes = [avaliacao.get("feedback_geral", "").strip()]

    pontos_fortes = avaliacao.get("pontos_fortes") or []
    if pontos_fortes:
        partes.append("Pontos fortes: " + "; ".join(pontos_fortes))

    pontos_melhoria = avaliacao.get("pontos_melhoria") or []
    if pontos_melhoria:
        partes.append("Pontos a melhorar: " + "; ".join(pontos_melhoria))

    return "\n\n".join(p for p in partes if p)
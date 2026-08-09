import json
import os

import httpx

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

NOTA_MINIMA_APROVACAO = 60


class AvaliacaoIAIndisponivel(Exception):
    """Levantada quando a Groq API falha, dá timeout ou retorna algo não parseável."""


def _montar_prompt(case_titulo: str, case_descricao: str, nivel_expertise: str, solucao_texto: str) -> str:
    return f"""Você é um avaliador técnico de soluções de cases de TI para candidatos em processo seletivo, nível {nivel_expertise}.

CASE: {case_titulo}
DESCRIÇÃO DO CASE:
{case_descricao}

SOLUÇÃO ENVIADA PELO CANDIDATO:
{solucao_texto}

Avalie a solução considerando: clareza do raciocínio, adequação técnica ao nível do candidato, completude em relação ao que o case pede, e criatividade.

Responda APENAS com um JSON válido, sem markdown e sem texto fora do JSON, no formato exato:
{{"nota": <inteiro de 0 a 100>, "pontos_fortes": ["...", "..."], "pontos_melhoria": ["...", "..."], "feedback_geral": "..."}}
"""


async def avaliar_solucao_ia(
    case_titulo: str,
    case_descricao: str,
    nivel_expertise: str,
    solucao_texto: str,
) -> dict:
    """
    Chama a Groq API para avaliar uma solução de case.
    Retorna dict com: nota (int), pontos_fortes (list[str]), pontos_melhoria (list[str]), feedback_geral (str).
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

    nota = avaliacao.get("nota")
    if not isinstance(nota, (int, float)) or not (0 <= nota <= 100):
        raise AvaliacaoIAIndisponivel(f"Nota retornada pela IA é inválida: {nota!r}")

    return {
        "nota": int(nota),
        "pontos_fortes": avaliacao.get("pontos_fortes", []),
        "pontos_melhoria": avaliacao.get("pontos_melhoria", []),
        "feedback_geral": avaliacao.get("feedback_geral", ""),
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
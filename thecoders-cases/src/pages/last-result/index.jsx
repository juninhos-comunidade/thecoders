import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./index.css";
import Navbar from "../../components/navbar";
import Buttons from "../../components/buttons";
import Resume from "../../components/resume";
import Score from "../../components/score";
import { API_BASE_URL } from "../../config/api";
import { abreviarNivel } from "../../utils/nivel";

// Notas exibidas quando não há nenhum resultado real para o usuário
// (ex.: acesso direto à página, sem ter concluído nenhum case).
const NOTAS_ZERADAS = {
    raciocinioLogico: "0,0",
    qualidadeTecnica: "0,0",
    resolucaoProblemas: "0,0",
    comunicacao: "0,0",
    priorizacao: "0,0",
    colaboracao: "0,0",
};



const FEEDBACK_SEM_CASE =
    "Você ainda não concluiu nenhum case.<br/><br/>" +
    "Participe de um case no lobby para receber sua avaliação de desempenho e acompanhar sua evolução por aqui.";

    function formatarNota(valor) {
    if (valor === null || valor === undefined) return "0,0";
    return valor.toFixed(1).replace(".", ",");
}

export default function LastResult() {
    const location = useLocation();
    const resultado = location.state?.resultado;
    const usuarioId = location.state?.usuarioId;
    const usuarioNome = location.state?.usuarioNome;

    // Nível do usuário exibido na Navbar (E/J/S), buscado do perfil real —
    // por padrão parte de "E" e é atualizado assim que o perfil chega.
    const [nivelExibido, setNivelExibido] = useState("E");

    const [ultimoResultadoBuscado, setUltimoResultadoBuscado] = useState(null);

useEffect(() => {
    if (resultado || !usuarioId) return;

    let cancelado = false;

    (async () => {
        try {
            const resposta = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/resultados`);
            if (!resposta.ok || cancelado) return;

            const dados = await resposta.json();
            if (!cancelado) setUltimoResultadoBuscado(dados.ultimo_resultado);
        } catch (erro) {
            console.error("Não foi possível buscar o último resultado:", erro);
        }
    })();

    return () => {
        cancelado = true;
    };
}, [resultado, usuarioId]);

    useEffect(() => {
        if (!usuarioId) return;

        let cancelado = false;

        (async () => {
            try {
                const resposta = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/perfil`);
                if (!resposta.ok || cancelado) return;

                const perfil = await resposta.json();
                if (!cancelado) {
                    setNivelExibido(abreviarNivel(perfil.nivel_expertise));
                }
            } catch (erro) {
                console.error("Não foi possível carregar o nível do usuário:", erro);
            }
        })();

        return () => {
            cancelado = true;
        };
    }, [usuarioId]);

    // Só existe um resultado "de verdade" quando o backend avaliou a solução
    // e retornou as notas por categoria (POST /avaliacao, status "avaliado").
    
    
    const possuiResultadoDireto =
    Boolean(resultado) &&
    resultado.status === "avaliado" &&
    Boolean(resultado.notas_categorias);

const possuiResultadoBuscado = Boolean(ultimoResultadoBuscado);

const notas = possuiResultadoDireto
    ? {
          raciocinioLogico: resultado.notas_categorias.raciocinioLogico ?? "0,0",
          qualidadeTecnica: resultado.notas_categorias.qualidadeTecnica ?? "0,0",
          resolucaoProblemas: resultado.notas_categorias.resolucaoProblemas ?? "0,0",
          comunicacao: resultado.notas_categorias.comunicacao ?? "0,0",
          priorizacao: resultado.notas_categorias.priorizacao ?? "0,0",
          colaboracao: resultado.notas_categorias.colaboracao ?? "0,0",
      }
    : possuiResultadoBuscado
    ? {
          raciocinioLogico: formatarNota(ultimoResultadoBuscado.nota_raciocinio_logico),
          qualidadeTecnica: formatarNota(ultimoResultadoBuscado.nota_qualidade_tecnica),
          resolucaoProblemas: formatarNota(ultimoResultadoBuscado.nota_resolucao_problemas),
          comunicacao: formatarNota(ultimoResultadoBuscado.nota_comunicacao),
          priorizacao: formatarNota(ultimoResultadoBuscado.nota_priorizacao),
          colaboracao: formatarNota(ultimoResultadoBuscado.nota_colaboracao),
      }
    : NOTAS_ZERADAS;

const feedback = possuiResultadoDireto
    ? resultado.feedback || FEEDBACK_SEM_CASE
    : possuiResultadoBuscado
    ? ultimoResultadoBuscado.feedback_simulado || FEEDBACK_SEM_CASE
    : FEEDBACK_SEM_CASE;

    return (
        <>
            {}
            <header className="header-azul">
                <Navbar nivel={nivelExibido} usuarioId={usuarioId} usuarioNome={usuarioNome} />
            </header>

            <div className="container-last-result">
                <div className="textos-last-result">
                    <div className="h3-last-result">Resultado do último case</div>
                    <div className="return">
                        <Buttons label="Voltar ao Lobby" page="/lobby" state={{ usuarioId, usuarioNome }} />
                    </div>
                </div>

                <div className="cards-last-result">
                    <Score notas={notas} />

                    <Resume texto={feedback} />
                </div>
            </div>
        </>
    );
}
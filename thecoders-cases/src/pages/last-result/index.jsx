import "./index.css";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/navbar";
import Buttons from "../../components/buttons";
import Resume from "../../components/resume";
import Score from "../../components/score";

const NOTA_INDISPONIVEL = "—";

function formatarNotasParaScore(notasCategorias) {
    if (!notasCategorias) return null;

    return Object.fromEntries(
        Object.entries(notasCategorias).map(([chave, valor]) => [
            chave,
            valor ?? NOTA_INDISPONIVEL,
        ])
    );
}

export default function LastResult() {
    const location = useLocation();
    const resultado = location.state?.resultado;

    const notas = formatarNotasParaScore(resultado?.notas_categorias);
    const feedback = resultado?.feedback;

    return (
        <>
            {}
            <header className="header-azul">
                <Navbar nivel="E" />
            </header>

            <div className="container-last-result">
                <div className="textos">
                    <h3>Resultado do último case</h3>
                    <div className="return">
                        <Buttons label="Voltar ao Lobby" page="/lobby" />
                    </div>
                </div>

                {resultado ? (
                    <>
                        <div className="status-avaliacao">
                            {resultado.aprovado ? (
                                <p className="status-aprovado">
                                    ✅ Aprovado {resultado.xp_ganho ? `(+${resultado.xp_ganho} XP)` : ""}
                                </p>
                            ) : (
                                <p className="status-reprovado">❌ Não aprovado</p>
                            )}
                        </div>

                        <div className="cards-container">
                            <Score notas={notas} />
                            <Resume texto={feedback || "Sem feedback disponível para este resultado."} />
                        </div>
                    </>
                ) : (
                    <div className="cards-container">
                        <p>
                            Nenhum resultado recente para mostrar. Resolva um case para ver sua
                            avaliação aqui.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
import { useEffect, useRef, useState } from "react";
import "./index.css";
import Timer from "../../components/timer";
import SendMsgBar from "../../components/send-msg-bar";


const formatarTempoGasto = (segundosTotais) => {
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = segundosTotais % 60;

    if (minutos <= 0) {
        return `${segundos}s`;
    }

    return `${minutos}min ${segundos.toString().padStart(2, "0")}s`;
};

export default function CaseDescription({
    title,
    dificulty,
    description,
    onSubmitSolution,
    timeLimit,
    envioBloqueado,
}) {

    const databaseTimer = {
        isRunning: true,
        secondsRemaining: 18 * 60,
    };

    // Marca o instante em que o case começou a ser exibido, pra calcular
    // quanto tempo o usuário levou até confirmar o envio.
    const inicioRef = useRef(Date.now());

    const [solucaoPendente, setSolucaoPendente] = useState(null);
    const [tempoGastoSegundos, setTempoGastoSegundos] = useState(0);

    // Reinicia o cronômetro de "tempo gasto" sempre que um novo case é carregado
    // (title muda quando o socket manda "case:nova_case", por exemplo).
    useEffect(() => {
        inicioRef.current = Date.now();
    }, [title]);

    const handleTentativaEnvio = (texto) => {
        const textoLimpo = texto?.trim();
        if (!textoLimpo) return;

        const segundosGastos = Math.max(0, Math.round((Date.now() - inicioRef.current) / 1000));
        setTempoGastoSegundos(segundosGastos);
        setSolucaoPendente(textoLimpo);
    };

    const handleCancelarEnvio = () => {
        setSolucaoPendente(null);
    };

    const handleConfirmarEnvio = () => {
        onSubmitSolution(solucaoPendente);
        setSolucaoPendente(null);
    };

    return (
        <div className="case-box">
            <div className="header-case">
                <div className="header-case-info">
                    <h3 className="case-title">📋 {title}</h3>
                    <div className="case-detail">
                        <span className="case-detail-label">Dificuldade:</span>
                        <span className="case-detail-value">
                            {dificulty}
                        </span>
                    </div>
                </div>

                <Timer
                    value={60 * timeLimit}
                    startSignal={databaseTimer.isRunning}
                    label="Tempo"
                    color="#79D9EF"
                    trackColor="#D9D9D9"
                    textColor="#213A57"
                    size={100}
                    strokeWidth={8}
                />
            </div>

            <div className="description">
                <p className="description-text">
                    {description}
                </p>
            </div>

            {envioBloqueado && (
                <p className="envio-bloqueado-aviso">
                    Você saiu da tela cheia e perdeu a chance de enviar o arquivo. Refaça o teste.
                </p>
            )}

            <SendMsgBar

                placeholder={
                    envioBloqueado
                        ? "Envio indisponível"
                        : "Subir arquivo da solução"
                }
                onSubmit={handleTentativaEnvio}
                navigateOnSubmit={false}
                disabled={envioBloqueado}

            />

            {solucaoPendente !== null && (
                <div className="confirmar-entrega-overlay" role="dialog" aria-modal="true">
                    <div className="confirmar-entrega-modal">
                        <h3 className="confirmar-entrega-titulo">Confirmar entrega</h3>

                        <p className="confirmar-entrega-tempo">
                            Entregue em {formatarTempoGasto(tempoGastoSegundos)}
                        </p>

                        <p className="confirmar-entrega-label">Sua resposta:</p>
                        <div className="confirmar-entrega-resposta">
                            {solucaoPendente}
                        </div>

                        <p className="confirmar-entrega-pergunta">
                            Tem certeza que deseja entregar? Depois de confirmar não será possível editar.
                        </p>

                        <div className="confirmar-entrega-acoes">
                            <button
                                type="button"
                                className="confirmar-entrega-botao confirmar-entrega-botao--secundario"
                                onClick={handleCancelarEnvio}
                            >
                                Voltar e revisar
                            </button>
                            <button
                                type="button"
                                className="confirmar-entrega-botao confirmar-entrega-botao--primario"
                                onClick={handleConfirmarEnvio}
                            >
                                Confirmar entrega
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import ampulheta from "../../assets/ampulheta.svg";

export default function ProcessingSolution() {
    const navigate = useNavigate();
    const [secondsLeft, setSecondsLeft] = useState(5);

    const statusIcons = {
        done: "✔️",
        pending: "⏳",
        final: "🎉",
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((current) => {
                if (current <= 1) {
                    clearInterval(timer);
                    navigate("/lobby");
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="processing-page">
            <div className="processing-screen">
                <header className="processing-header">
                    <h1>Processando sua solução...</h1>
                </header>

                <div className="processing-layout">
                    <div className="processing-status">
                        <ul className="status-list">
                            <li className="status-item done">
                                <span className="status-icon">✓</span>
                                <span>Solução enviada</span>
                            </li>

                            <li className="status-item">
                                <span className="status-icon"> </span>
                                <span>Nossa IA está avaliando sua resolução</span>
                            </li>

                            <li className="status-item">
                                <span className="status-icon"> </span>
                                <span>Analisando...</span>
                            </li>

                            <li className="status-item done">
                                <span className="status-icon">✓</span>
                                <span>Entendimento do problema</span>
                            </li>

                            <li className="status-item done">
                                <span className="status-icon">✓</span>
                                <span>Estrutura da solução</span>
                            </li>

                            <li className="status-item pending">
                                <span className="status-icon">⏳</span>
                                <span>Avaliando justificativa...</span>
                            </li>

                            <li className="status-item pending">
                                <span className="status-icon">⏳</span>
                                <span>Comparando com solução referência...</span>
                            </li>

                            <li className="status-item pending">
                                <span className="status-icon">⏳</span>
                                <span>Gerando feedback...</span>
                            </li>

                            <li className="status-item dots">
                                <span className="status-icon empty">.</span>
                                <span className="status-placeholder">.</span>
                            </li>

                            <li className="status-item dots">
                                <span className="status-icon empty">.</span>
                                <span className="status-placeholder">.</span>
                            </li>

                            <li className="status-item dots">
                                <span className="status-icon empty">.</span>
                                <span className="status-placeholder">.</span>
                            </li>

                            <li className="status-item final">
                                <span className="status-icon trophy">🎉</span>
                                <span>Parabéns! Sua solução foi avaliada.</span>
                            </li>
                        </ul>

                        <div className="timer-out-page">
                            <span>Redirecionando em</span>
                            <span>{secondsLeft}s</span>
                        </div>
                    </div>

                    <div className="hourglass-scene" aria-label="Avaliando solução">
                        <img src={ampulheta} alt="Ampulheta" />
                    </div>
                </div>
            </div>
        </div>
    );
}
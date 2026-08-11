import "./index.css";
import Timer from "../../components/timer";
import SendMsgBar from "../../components/send-msg-bar";

export default function CaseDescription({ title, dificulty, description, timeLimit, onSubmitSolution }) {
    const databaseTimer = {
        isRunning: true,
        secondsRemaining: 18 * 60,
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

            <SendMsgBar
                placeholder="Subir arquivo da solução"
                onSubmit={onSubmitSolution}
                navigateOnSubmit={false}
            />
        </div>
    );
}
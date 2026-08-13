import "./index.css";
import Buttons from "../buttons";

export default function CardCases({ num = 0, dificuldade = "🟢 Fácil", limit = 10, usuarioId, usuarioNome }) {
    return (
        <div className="card-cases">
            <div className="h3-card-cases">Próximo Case</div>
            <div className="infos-card-cases">
                <div className="cases-concluidos">
                    <p>Cases concluídos: </p>
                    <span>{num}</span>
                </div>
                <div className="cases-dificuldade">
                    <p>Dificuldade dos cases: </p>
                    <span>{dificuldade}</span>
                </div>
                <div className="next-cases">
                    <p>Conclua</p>
                    <span>{Math.max(limit - num, 0)}</span>
                    <p>cases de nível</p>
                    <span>{dificuldade}</span>
                </div>
            </div>
            <div className="buttons">
                <Buttons label="Último Resultado" variant="white" disabled={false} page="/last-result" state={{ usuarioId, usuarioNome }} />
                <Buttons label="Iniciar Case" page="/on-case" state={{ usuarioId, usuarioNome }} />
            </div>
        </div>
    );
}
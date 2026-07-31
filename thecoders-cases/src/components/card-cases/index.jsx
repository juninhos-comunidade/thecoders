import "./index.css";
import "../../App.css";

import Buttons from "../buttons";

export default function CardCases({ num, dificult, limit }) {
    return (
        <div className="card-cases">
            <h3>Próximo Case</h3>
            <div className="texts">
                <div className="cases-concluidos">
                    <p>Cases concluídos: </p>
                    <span>{num}</span>
                </div>
                <div className="cases-dificuldade">
                    <p>Dificuldade dos cases: </p>
                    <span>{dificult}</span>
                </div>
                <div className="next-cases">
                    <p>Conclua</p>
                    <span>{limit - num}</span>
                    <p>cases de nível</p>
                    <span>{dificult}</span>
                </div>
            </div>
            <div className="buttons">
                <Buttons label="Último Resultado" variant="white" disabled={false} page="/last-result" />
                <Buttons label="Iniciar Case" page="/on-case" />
            </div>
        </div>
    );
}
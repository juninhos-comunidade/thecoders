import "./index.css";
import "../../App.css";

export default function CardProfile({ nivel, exp, nextLevel }) {
    return (
        <div className="card-profile">
            <h3>Seu Perfil</h3>
            <p className="text">{nivel}</p>
            <div className="infos">
                <p className="exp">XP: {exp}/1000</p>
                <div className="progress-bar">
                    <div className="progress" style={{ width: `${(exp / 1000) * 100}%` }}></div>
                </div>
                <div className="box">
                    <p className="next-level">Próximo nível: </p>
                    <span>{nextLevel}</span>
                </div>
            </div>
        </div>
    );
}
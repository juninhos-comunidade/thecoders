import "./index.css";
import "../../App.css";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/navbar";
import CardProfile from "../../components/card-profile";
import CardCases from "../../components/card-cases";

export default function Lobby() {
    const location = useLocation();
    const usuarioId = location.state?.usuarioId;
    const usuarioNome = location.state?.usuarioNome || "Usuário";

    return (
        <>
            {}
            <header className="header-azul">
                <Navbar nivel="E" />
            </header>

            <div className="container-lobby">
                <div className="textos">
                    <h3>Bem-vindo, {usuarioNome}!</h3>
                    <div className="title">Continue evoluindo resolvendo desafios reais</div>
                </div>

                <div className="cards">
                    <CardProfile nivel="Estagiário" exp="0" nextLevel="Júnior" />
                    <CardCases
                        num="0"
                        dificult="🟢 Fácil"
                        limit="10"
                        usuarioId={usuarioId}
                        usuarioNome={usuarioNome}
                    />
                </div>
            </div>
        </>
    );
}
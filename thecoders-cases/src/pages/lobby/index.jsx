import "./index.css";
import "../../App.css";
import Navbar from "../../components/navbar";
import CardProfile from "../../components/card-profile";
import CardCases from "../../components/card-cases";

// import { useNavigate } from "react-router-dom";

export default function Lobby() {
    // const navigate = useNavigate();

    return (
        <>
			<Navbar nivel="E" />

            <div className="container-lobby">
                <div className="textos">
                    <h3>Bem-vindo de volta!</h3>
                    <div className="title">Continue evoluindo resolvendo desafios reais</div>
                </div>

                <div className="cards">
                    <CardProfile nivel="Estagiário" exp="0" nextLevel="Júnior" />
                    <CardCases num="0" dificult="🟢 Fácil" limit="10" />
                </div>
            </div>
        </>
    );
}
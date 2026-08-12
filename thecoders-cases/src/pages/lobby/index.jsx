import "./index.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/navbar";
import CardProfile from "../../components/card-profile";
import CardCases from "../../components/card-cases";
import { API_BASE_URL } from "../../config/api";

const NIVEL_ABREVIACAO = {
    ESTAGIARIO: "E",
    JUNIOR: "J",
    SENIOR: "S",
};

const NIVEL = {
    ESTAGIARIO: "Estagiário",
    JUNIOR: "Júnior",
};

const PROXIMO_NIVEL = {
    ESTAGIARIO: "Júnior",
    JUNIOR: "Sênior",
    SENIOR: null,
};

const DIFICULDADE_POR_NIVEL = {
    ESTAGIARIO: "🟢 Fácil",
    JUNIOR: "🟡 Médio",
    SENIOR: "🔴 Difícil",
};

const padronizarNivel = (nivel) => {
    if (!nivel) return "ESTAGIARIO";
    return String(nivel).trim().toUpperCase().replace("Á", "A").replace("Í", "I").replace("É", "E").replace("Ó", "O").replace("Ú", "U");
};

export default function Lobby() {
    const location = useLocation();
    const usuarioId = location.state?.usuarioId;
    const [usuario, setUsuario] = useState({
        nome: location.state?.usuarioNome || "Usuário",
        nivel: padronizarNivel(location.state?.usuarioNivel || "ESTAGIARIO"),
        exp: Number(location.state?.usuarioExp ?? 0),
    });

    useEffect(() => {
        const carregarPerfil = async () => {
            if (!usuarioId) return;

            try {
                const resposta = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/perfil`);
                if (!resposta.ok) return;

                const dados = await resposta.json();
                const nivel = padronizarNivel(dados.nivel_expertise || "ESTAGIARIO");

                setUsuario((anterior) => ({
                    nome: dados.nome_completo || anterior.nome,
                    nivel,
                    exp: Number(dados.xp ?? anterior.exp),
                }));
            } catch (erro) {
                console.error("Não foi possível atualizar o perfil do lobby:", erro);
            }
        };

        carregarPerfil();
    }, [usuarioId]);

    const usuarioNivel = NIVEL[usuario.nivel] ?? "Estagiário";
    const usuarioExp = usuario.exp;
    const usuarioNome = usuario.nome;
    const usuarioProximoNivel = PROXIMO_NIVEL[usuarioNivel] ?? null;
    const caseDificuldade = DIFICULDADE_POR_NIVEL[usuarioNivel] ?? "🟢 Fácil";
    const nivelExibido = NIVEL_ABREVIACAO[usuarioNivel] ?? "E";

    return (
        <>
            <header className="header-azul">
                <Navbar nivel={nivelExibido} />
            </header>

            <div className="container-lobby">
                <div className="textos">
                    <h3>Bem-vindo, {usuarioNome}!</h3>
                    <div className="title">Continue evoluindo resolvendo desafios reais</div>
                </div>

                <div className="cards">
                    <CardProfile nivel={usuarioNivel} exp={usuarioExp} nextLevel={usuarioProximoNivel} />
                    <CardCases
                        num={0}
                        dificuldade={caseDificuldade}
                        limit={10}
                        usuarioId={usuarioId}
                        usuarioNome={usuarioNome}
                    />
                </div>
            </div>
        </>
    );
}
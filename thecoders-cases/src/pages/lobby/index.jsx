import "./index.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/navbar";
import CardProfile from "../../components/card-profile";
import CardCases from "../../components/card-cases";
import { API_BASE_URL } from "../../config/api";
import { NIVEL_ABREVIACAO, NIVEL_LABEL as NIVEL, padronizarNivel } from "../../utils/nivel";

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

    // usuario.nivel é o código bruto vindo do backend (ex.: "JUNIOR"); todas as
    // tabelas abaixo são indexadas por esse código. Só convertemos para o
    // rótulo em português (ex.: "Júnior") no momento de exibir para o usuário.
    const nivelCodigo = usuario.nivel;
    const usuarioNivel = NIVEL[nivelCodigo] ?? "Estagiário";
    const usuarioExp = usuario.exp;
    const usuarioNome = usuario.nome;
    const usuarioProximoNivel = PROXIMO_NIVEL[nivelCodigo] ?? null;
    const caseDificuldade = DIFICULDADE_POR_NIVEL[nivelCodigo] ?? "🟢 Fácil";
    const nivelExibido = NIVEL_ABREVIACAO[nivelCodigo] ?? "E";

    return (
        <div className="pagina-lobby">
            <header className="header-azul">
                <Navbar nivel={nivelExibido} usuarioId={usuarioId} usuarioNome={usuarioNome} />
            </header>

            <div className="container-lobby">
                <div className="textos-lobby">
                    <div className="h3-lobby" >Boas-vindas, {usuarioNome}!</div>
                    <div className="subtitle" > Continue evoluindo resolvendo desafios reais</div>
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
        </div>
    );
}
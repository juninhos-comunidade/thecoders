import "./index.css";
import ChatBox from "../../components/chat-box";
import CaseDescription from "../../components/case-description";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config/api";

const socket = io("http://localhost:3000", {
    autoConnect: true,
});

const mapearDificuldade = (valor) => {
    const chave = String(valor || "FACIL").trim().toUpperCase();

    const mapa = {
        FACIL: "🟢 Fácil",
        MEDIO: "🟡 Médio",
        DIFICIL: "🔴 Difícil",
    };

    return mapa[chave] || "🟢 Fácil";
};

const converterTempoParaMinutos = (valor) => {
    if (valor == null || valor === "") return 18;

    if (typeof valor === "number" && Number.isFinite(valor)) {
        return Math.max(1, Math.round(valor));
    }

    if (typeof valor === "string") {
        const texto = valor.trim();

        if (/^\d+(?:[.,]\d+)?$/.test(texto)) {
            return Math.max(1, Math.round(Number(texto.replace(",", "."))));
        }

        const matchTempo = texto.match(/(\d+):(\d+):(\d+)/);
        if (matchTempo) {
            const [, horas, minutos, segundos] = matchTempo;
            const totalMinutos = Number(horas) * 60 + Number(minutos) + Number(segundos) / 60;
            return Math.max(1, Math.round(totalMinutos));
        }

        const matchMinutos = texto.match(/(\d+):(\d+)/);
        if (matchMinutos) {
            const [, minutos, segundos] = matchMinutos;
            const totalMinutos = Number(minutos) + Number(segundos) / 60;
            return Math.max(1, Math.round(totalMinutos));
        }
    }

    return 18;
};

const normalizarCase = (caseData) => {
    if (!caseData) return null;

    return {
        id: caseData.id,
        salaId: caseData.salaId || null,
        title: caseData.titulo || caseData.title || "Case sem título",
        dificulty: mapearDificuldade(caseData.nivel_dificuldade || caseData.dificulty),
        description: caseData.descricao || caseData.description || "Sem descrição disponível.",
        timeLimit: converterTempoParaMinutos(caseData.tempo_minimo_busca ?? caseData.timeLimit ?? 18),
    };
};

export default function OnCase() {
    const navigate = useNavigate();
    const location = useLocation();
    const usuarioId = location.state?.usuarioId;
    const usuarioNome = location.state?.usuarioNome || "Você";

    const isNavigatingAway = useRef(false);

    const [currentCase, setCurrentCase] = useState({
        id: null,
        salaId: null,
        title: "Carregando case...",
        dificulty: "🟢 Fácil",
        description: "Buscando detalhes do case no banco de dados...",
        timeLimit: 18,
    });

    useEffect(() => {
        const carregarCase = async () => {
            const caseId = location.state?.caseId;

            try {
                if (caseId) {
                    const resposta = await fetch(`${API_BASE_URL}/cases/${caseId}`);
                    if (!resposta.ok) return;

                    const dados = await resposta.json();
                    setCurrentCase(normalizarCase(dados));
                    return;
                }

                const perfilResposta = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/perfil`);
                if (!perfilResposta.ok) {
                    const respostaFallback = await fetch(`${API_BASE_URL}/cases`);
                    if (!respostaFallback.ok) return;

                    const dadosFallback = await respostaFallback.json();
                    const proximoCase = dadosFallback.cases?.[0];
                    if (proximoCase) {
                        setCurrentCase(normalizarCase(proximoCase));
                    }
                    return;
                }

                const perfil = await perfilResposta.json();
                const respostaCase = await fetch(
                    `${API_BASE_URL}/cases/aleatorio?usuario_id=${usuarioId}&nivel_usuario=${encodeURIComponent(perfil.nivel_expertise || "ESTAGIARIO")}`
                );

                if (!respostaCase.ok) return;

                const dadosCase = await respostaCase.json();
                setCurrentCase(normalizarCase(dadosCase));
            } catch (erro) {
                console.error("Erro ao carregar o case do usuário:", erro);
            }
        };

        if (usuarioId || location.state?.caseId) {
            carregarCase();
        }
    }, [location.state?.caseId, usuarioId]);

    // Controla se o usuário perdeu o direito de enviar o arquivo
    const [envioBloqueado, setEnvioBloqueado] = useState(false);

    const exitFullscreen = useCallback(() => {
        if (!document.fullscreenElement) return;

        const exit =
            document.exitFullscreen ||
            document.webkitExitFullscreen ||
            document.msExitFullscreen;

        if (exit) {
            exit.call(document).catch((err) => {
                console.warn("Não foi possível sair da tela cheia:", err);
            });
        }
    }, []);

    // Em vez de mandar pro lobby, agora bloqueia o envio e avisa o servidor
    const emitirInfracaoSair = useCallback(() => {
        setEnvioBloqueado((jaBloqueado) => {
            if (jaBloqueado) return jaBloqueado;

            socket.emit("case:infracao_detectada", {
                motivo: "Um dos participantes saiu da tela cheia ou trocou de aba.",
            });

            return true;
        });
    }, []);

    const enterFullscreen = useCallback(() => {
        const el = document.documentElement;
        if (document.fullscreenElement) return;

        const request =
            el.requestFullscreen ||
            el.webkitRequestFullscreen ||
            el.msRequestFullscreen;

        if (request) {
            request.call(el).catch((err) => {
                console.warn("Não foi possível entrar em tela cheia:", err);
            });
        }
    }, []);

    useEffect(() => {
        enterFullscreen();

        const handleFirstInteraction = () => {
            enterFullscreen();
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
        };

        window.addEventListener("click", handleFirstInteraction);
        window.addEventListener("keydown", handleFirstInteraction);

        const handleFullscreenChange = () => {
            const aindaEmFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            );

            if (!aindaEmFullscreen) {
                emitirInfracaoSair();
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                emitirInfracaoSair();
            }
        };

        // "blur" foi removido de propósito: ele disparava toda vez que
        // qualquer diálogo nativo abria (ex: seletor de arquivo), jogando
        // o usuário pro lobby sem ele ter saído de fato da tela cheia.

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("msfullscreenchange", handleFullscreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        socket.on("case:redirecionar_lobby", (data) => {
            isNavigatingAway.current = true;
            exitFullscreen();
            navigate("/lobby", {
                state: {
                    aviso:
                        data?.mensagem ||
                        "Um participante saiu da tela de resolução. Todos foram redirecionados.",
                },
            });
        });

        socket.on("case:nova_case", (novaCase) => {
            setCurrentCase(novaCase);
            isNavigatingAway.current = false;
            setEnvioBloqueado(false); // libera de novo no próximo case
            enterFullscreen();
        });

        return () => {
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("msfullscreenchange", handleFullscreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);

            socket.off("case:redirecionar_lobby");
            socket.off("case:nova_case");

            isNavigatingAway.current = true;
            exitFullscreen();
        };
    }, [enterFullscreen, exitFullscreen, emitirInfracaoSair, navigate]);

    const handleSubmitSolution = useCallback(
        (texto) => {
            const solucaoEnviada = texto?.trim();
            if (!solucaoEnviada) return;

            navigate("/processing-solution", {
                state: {
                    usuarioId,
                    caseId: currentCase.id,
                    salaId: currentCase.salaId,
                    solucaoEnviada,
                },
            });
        },
        [navigate, usuarioId, currentCase.id, currentCase.salaId]
    );

    return (
        <div className="container-oncase">
            <CaseDescription
                title={currentCase.title}
                dificulty={currentCase.dificulty}
                description={currentCase.description}
                timeLimit={currentCase.timeLimit}

                onSubmitSolution={handleSubmitSolution}

                envioBloqueado={envioBloqueado}

            />

            <ChatBox messages={[]} user={usuarioNome} />
        </div>
    );
}
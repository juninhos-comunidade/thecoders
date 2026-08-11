import "./index.css";
import ChatBox from "../../components/chat-box";
import CaseDescription from "../../components/case-description";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    autoConnect: true,
});

export default function OnCase() {
    const navigate = useNavigate();
    const location = useLocation();
    const usuarioId = location.state?.usuarioId;
    const usuarioNome = location.state?.usuarioNome || "Você";

    const isNavigatingAway = useRef(false);


 
    // TODO: id e salaId hoje são mockados. Quando o matchmaking (serviço de socket)
    // passar a emitir "case:nova_case" com dados reais, esses campos devem vir de lá
    // (ver socket.on("case:nova_case", ...) abaixo, que já atualiza currentCase inteiro).

    const [currentCase, setCurrentCase] = useState({
        id: 18,
        salaId: null,
        title: "Case #18 - API de Agendamento",
        dificulty: "🟢 Fácil",
        description:
            "Descrição do case - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        timeLimit: 18,
    });

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
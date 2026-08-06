import "./index.css";
import ChatBox from "../../components/chat-box";
import CaseDescription from "../../components/case-description";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    autoConnect: true,
});

export default function OnCase() {
    const navigate = useNavigate();

 
    const isNavigatingAway = useRef(false);

 
    const [currentCase, setCurrentCase] = useState({
        id: 18,
        title: "Case #18 - API de Agendamento",
        dificulty: "🟢 Fácil",
        description:
            "Descrição do case - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        timeLimit: 18,
    });

    
    const emitirInfracaoSair = useCallback(() => {
        if (isNavigatingAway.current) return;
        isNavigatingAway.current = true;

        
        socket.emit("case:infracao_detectada", {
            motivo: "Um dos participantes saiu da tela cheia ou trocou de aba.",
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

        
        const handleBlur = () => {
            emitirInfracaoSair();
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("msfullscreenchange", handleFullscreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        
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
            enterFullscreen();
        });

        return () => {
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("msfullscreenchange", handleFullscreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);

            
            socket.off("case:redirecionar_lobby");
            socket.off("case:nova_case");

            isNavigatingAway.current = true;
            exitFullscreen();
        };
    }, [enterFullscreen, exitFullscreen, emitirInfracaoSair, navigate]);

    return (
        <div className="container-oncase">
            <CaseDescription
                title={currentCase.title}
                dificulty={currentCase.dificulty}
                description={currentCase.description}
                timeLimit={currentCase.timeLimit}
            />

            <ChatBox messages={[]} user="Gabriela" />
        </div>
    );
}
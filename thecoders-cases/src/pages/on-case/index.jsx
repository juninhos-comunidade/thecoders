import "./index.css";
import ChatBox from "../../components/chat-box";
import CaseDescription from "../../components/case-description";
import { useCallback, useEffect } from "react";

export default function OnCase() {
    const enterFullscreen = useCallback(() => {
        const el = document.documentElement;

        if (document.fullscreenElement) return; // já está em tela cheia

        const request =
            el.requestFullscreen ||
            el.webkitRequestFullscreen || // Safari
            el.msRequestFullscreen;       // versões antigas do Edge/IE

        if (request) {
            request.call(el).catch((err) => {
                console.warn("Não foi possível entrar em tela cheia automaticamente:", err);
            });
        }
    }, []);

    const exitFullscreen = useCallback(() => {
        if (!document.fullscreenElement) return; // já não está em tela cheia

        const exit =
            document.exitFullscreen ||
            document.webkitExitFullscreen || // Safari
            document.msExitFullscreen;       // versões antigas do Edge/IE

        if (exit) {
            exit.call(document).catch((err) => {
                console.warn("Não foi possível sair da tela cheia automaticamente:", err);
            });
        }
    }, []);

    useEffect(() => {
        // Tenta automaticamente ao carregar
        enterFullscreen();

        // Fallback: se o navegador bloquear, ativa no primeiro clique/tecla
        const handleFirstInteraction = () => {
            enterFullscreen();
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
        };

        window.addEventListener("click", handleFirstInteraction);
        window.addEventListener("keydown", handleFirstInteraction);

        return () => {
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);

            // Sai da tela cheia ao desmontar (sair da página)
            exitFullscreen();
        };
    }, [enterFullscreen, exitFullscreen]);
    
    return (
        <>
            <div className="container-oncase">
                <CaseDescription 
                    title="Case #18 - API de Agendamento"
                    dificulty="🟢 Fácil"
                    description="Descrição do case - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate  velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint  occaecat cupidatat non proident, sunt in culpa qui officia deserunt  mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate  velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint  occaecat cupidatat non proident, sunt in culpa qui officia deserunt  mollit anim id est laborum."
                    timeLimit={18} // 18 minutes
                />
                
                <ChatBox messages={[]} />
            </div>
        </>
    );
}
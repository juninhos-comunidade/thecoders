import "./index.css";
import ChatBox from "../../components/chat-box";
import CaseDescription from "../../components/case-description";

export default function OnCase() {
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
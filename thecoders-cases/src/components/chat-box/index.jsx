import { useState } from "react";
import "./index.css";
import SendMsgBar from "../send-msg-bar";

export default function ChatBox({ initialMessages = [] }) {
    const [messages, setMessages] = useState(initialMessages);

    const handleSendMessage = (text) => {
        const cleanText = text?.trim();

        if (!cleanText) return;

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text: cleanText,
            },
        ]);
    };

    return (
        <div className="side-sheet">
            <div className="header-chat">
                <p className="text">Chat da sala</p>
            </div>

            <div className="content-chat">
                <div className="building-blocks">
                    {messages.map((msg, index) => (
                        <div id="msg-text"
                            key={index} 
                            className={`message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
            </div>

            <div className="actions-chat">
                <SendMsgBar
                    placeholder="Mensagem"
                    buttonLabel="Enviar"
                    onSubmit={handleSendMessage}
                    navigateOnSubmit={false}
                />
            </div>
        </div>
    );
}
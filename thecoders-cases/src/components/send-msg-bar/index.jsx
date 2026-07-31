import { useState } from "react";
import "./index.css";

export default function SendMsgBar({
    placeholder = "Digite sua resposta...",
    value,
    onChange,
    onSubmit,
    buttonLabel = "Enviar",
}) {
    const [internalValue, setInternalValue] = useState("");
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (event) => {
        const nextValue = event.target.value;

        if (onChange) {
            onChange(nextValue);
            return;
        }

        setInternalValue(nextValue);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit?.(currentValue);
    };

    return (
        <form className="send-msg-bar" onSubmit={handleSubmit}>
            <div className="send-msg-bar__frame">
                <div className="send-msg-bar__state-layer">
                    <div className="send-msg-bar__content">
                        <input
                            type="text"
                            className="send-msg-bar__input"
                            value={currentValue}
                            onChange={handleChange}
                            placeholder={placeholder}
                            aria-label="Mensagem"
                        />
                    </div>

                    <button type="submit" className="send-msg-bar__button" aria-label={buttonLabel}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3.4 20.4L21 12 3.4 3.6l1.1 6.3L15 12l-10.5 2.1-1.1 6.3z" />
                        </svg>
                    </button>
                </div>
            </div>
        </form>
    );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function SendMsgBar({
    placeholder = "Digite sua resposta...",
    value,
    onChange,
    onSubmit,
    buttonLabel = "Enviar",
    redirectTo,
    navigateOnSubmit = Boolean(redirectTo),
    disabled = false,
}) {
    const navigate = useNavigate();

    const [internalValue, setInternalValue] = useState("");
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (event) => {
        if (disabled) return;

        const nextValue = event.target.value;

        if (onChange) {
            onChange(nextValue);
            return;
        }

        setInternalValue(nextValue);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (disabled) return;

        if (onSubmit) {
            onSubmit(currentValue);
        }

        if (value === undefined) {
            setInternalValue("");
        }

        if (navigateOnSubmit && redirectTo) {
            navigate(redirectTo);
        }
    };

    return (
        <form
            className={`send-msg-bar${disabled ? " send-msg-bar--disabled" : ""}`}
            onSubmit={handleSubmit}
        >
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
                            disabled={disabled}
                        />
                    </div>

                    <button
                        type="submit"
                        className="send-msg-bar__button"
                        aria-label={buttonLabel}
                        disabled={disabled}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3.4 20.4L21 12 3.4 3.6l1.1 6.3L15 12l-10.5 2.1-1.1 6.3z" />
                        </svg>
                    </button>
                </div>
            </div>
        </form>
    );
}
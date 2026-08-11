import "./index.css";
import "../../App.css";
import { useNavigate } from "react-router-dom";

export default function Buttons({ label, variant = "primary", disabled = false, page, state }) {
    const className = ["btn-primary", variant === "white" ? "btn-primary--white" : ""].join(" ").trim();
    const navigate = useNavigate();

    return (
        <button
            type="button"
            className={className}
            disabled={disabled}
            onClick={() => {
                if (!disabled && page) {
                    navigate(page, state ? { state } : undefined);
                }
            }}
        >
            <div className="content">
                <div className="state-layer">
                    <div className="button-text">{label}</div>
                </div>
            </div>
        </button>
    );
}
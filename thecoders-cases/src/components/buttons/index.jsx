import "./index.css";
import "../../App.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function Buttons({ label, variant = "primary", disabled = false, page }) {
    const className = ["btn-primary", variant === "white" ? "btn-primary--white" : ""].join(" ").trim();
    const location = useLocation();
    const navigate = useNavigate();

    if (location.pathname !== "/last-result" && location.pathname !== "/on-case") {
        return (
            <button
                type="button"
                className={className}
                disabled={disabled}
                onClick={() => {
                    if (!disabled && page) {
                        navigate(page);
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

    return null;
}
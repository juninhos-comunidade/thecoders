import "./index.css";
import "../../App.css";

export default function Buttons({ label, variant = "primary", disabled = false }) {
    const className = ["btn-primary", variant === "white" ? "btn-primary--white" : ""].join(" ").trim();

    return (
        <button className={className} disabled={disabled}>
            <div className="content">
                <div className="state-layer">
                    <div className="button-text">{label}</div>
                </div>
            </div>
        </button>
    );
}
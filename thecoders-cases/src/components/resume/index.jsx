import "./index.css";
import "../../App.css";

export default function Resume({ texto }) {
    return (
        <div className="container-resume">
            <h3>Resumo</h3>
            <p className="text" dangerouslySetInnerHTML={{ __html: texto }} />
        </div>
    );
}
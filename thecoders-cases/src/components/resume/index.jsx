import "./index.css";

export default function Resume({ texto }) {
    return (
        <div className="container-resume">
            <h3>Resumo</h3>
            <p className="resume-text" dangerouslySetInnerHTML={{ __html: texto }} />
        </div>
    );
}
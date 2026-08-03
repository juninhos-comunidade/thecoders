import "./index.css";

export default function Resume({ texto }) {
    return (
        <div className="container-resume">
            <p className="resume-title">Resumo</p>
            <div className="resume-text" dangerouslySetInnerHTML={{ __html: texto }} />
        </div>
    );
}
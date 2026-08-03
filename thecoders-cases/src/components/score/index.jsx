import "./index.css";

export default function Score({ notas }) {
    return (
        <div className="container-score">
            <h3>Avaliação</h3>

            <div className="cabecalho-score">
                <p className="text-lin">Competências</p>
                <p className="text-lin">Nota</p>
            </div>

            <div className="linha-score">
                <p className="text-lin">🧠 Raciocínio lógico</p>
                <p className="text-lin">{notas.raciocinioLogico}</p>
            </div>
            <div className="linha-score">
                <p className="text-lin">💻 Qualidade técnica</p>
                <p className="text-lin">{notas.qualidadeTecnica}</p>
            </div>
            <div className="linha-score">
                <p className="text-lin">🧩 Resolução de problemas</p>
                <p className="text-lin">{notas.resolucaoProblemas}</p>
            </div>
            <div className="linha-score">
                <p className="text-lin">🗣 Comunicação</p>
                <p className="text-lin">{notas.comunicacao}</p>
            </div>
            <div className="linha-score">
                <p className="text-lin">⚖ Priorização</p>
                <p className="text-lin">{notas.priorizacao}</p>
            </div>
            <div className="linha-score">
                <p className="text-lin">🤝 Colaboração</p>
                <p className="text-lin">{notas.colaboracao}</p>
            </div>
        </div>
    );
}
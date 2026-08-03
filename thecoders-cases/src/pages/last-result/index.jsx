import "./index.css";
import Navbar from "../../components/navbar";
import Buttons from "../../components/buttons";
import Resume from "../../components/resume";
import Score from "../../components/score";

export default function LastResult() {

    return (
        <>
			<Navbar nivel="E" />

            <div className="container-last-result">
                <div className="textos">
                    <h3>Resultado do último case</h3>
                    <div className="return">
                        <Buttons label="Voltar ao Lobby" page="/lobby" />
                    </div>
                </div>

                <div className="cards-container">
                    <Score notas={{
                        raciocinioLogico: "9,0",
                        qualidadeTecnica: "8,5",
                        resolucaoProblemas: "9,5",
                        comunicacao: "7,0",
                        priorizacao: "8,9",
                        colaboracao: "9,0"
                    }} />

                    <Resume texto="Você apresentou uma solução consistente,
                            bem estruturada e funcional.

                            <br/><br/>Sua principal força foi a organização da arquitetura.

                            <br/><br/>A maior oportunidade de melhoria está na
                            documentação e na justificativa das decisões." />
                </div>
            </div>
        </>
    );
}
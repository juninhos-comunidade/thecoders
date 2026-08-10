import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useState } from "react";
import "./index.css"
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";

const slides = [
    {title: "Boas vindas ao theCoders Cases!", text: "Esse espaço foi pensado especialmente para quem está começando na área de TI e quer treinar na prática. Aqui você vai simular cases reais, em grupo, como os que costumam aparecer em processos seletivos, uma forma de ganhar confiança e experiência antes da entrevista de verdade."},
    {title: "Como funciona o case", text: "Quando você clicar em 'Começar', vamos te levar automaticamente para a sala de case mais adequada para o seu nível de expertise e nível de dificuldade atual. Assim que o case aparecer na tela, o cronômetro começa a contar, mas o tempo é seu para usar como quiser."},
    {title: "Como funciona o case", text: "Nossa dica: divida esse tempo em algumas etapas, como leitura do case, entendimento do problema, definição do que cada pessoa do grupo vai fazer, e por fim a apresentação da solução. Quando o tempo acabar, o case é encerrado automaticamente e parte para a avaliação."},
    {title: "Avaliação e confidencialidade", text: "Ao final de cada case, uma IA faz uma avaliação do seu desempenho individual, mas fica tranquilo(a): essa avaliação é só um apoio para o seu aprendizado, ela não substitui a análise de um profissional real. E o mais importante: seus resultados e desempenho são confidenciais. Eles não são divulgados para ninguém, nem para outros participantes, nem para empresas. Servem só como dado educacional, de uso exclusivamente seu, para você acompanhar sua própria evolução."},
    {title: "Como funciona a evolução de nível", text: "Você começa como Estagiário, com acesso liberado aos cases fáceis e médios. Conforme você vai completando cases, vai ganhando XP e, ao acumular XP suficiente, sobe automaticamente para o nível Junior. Ao virar Junior, você desbloqueia os cases difíceis e pode seguir treinando entre médios e difíceis, no seu ritmo."}
]

function Tutorial () {
    const navigate = useNavigate();
    const [slideIndex, setSlideIndex] = useState(0);
    const location = useLocation();
    const usuarioId = location.state?.usuarioId;
    const currentSlide = slides[slideIndex];

    const finalizarTutorial = async () => {
    try {
        if (usuarioId) {
            await fetch(
                `http://127.0.0.1:8000/usuarios/${usuarioId}/tutorial-visto`,
                { method: "PATCH" }
            );
        }
    } catch (err) {
        console.log("Não foi possível marcar o tutorial como visto:", err);
    } finally {
        navigate("/lobby");
    }
};

    let backButtonClass = "nav-button";

  if (slideIndex === 0) {
    backButtonClass = "nav-button nav-button-disabled";
  }

  let nextButtonClass = "nav-button";

  if (slideIndex === 4) {
    nextButtonClass = "nav-button nav-button-disabled";
  }

  function getDotClass(i) {
  let dotClass = "progress-dot";

  if (i === slideIndex) {
    dotClass = "progress-dot progress-dot-active";
  }

  return dotClass;
}

let finishButton = null;
if (slideIndex === 4) {
  finishButton = (
    <button className="finish-button" onClick={finalizarTutorial}>
      Finalizar Tutorial
    </button>
  );
}


    return (

        <div className="tutorial-container"> {/*englobará tudo: card, botoes, etc*/}

        <div className="tutorial-content">

            

            <button className={backButtonClass} onClick ={ () => 
                {
                    if (slideIndex > 0) {
                        setSlideIndex(slideIndex - 1);
                }
                }}><FaCircleChevronLeft/></button>

            <div className="card-tutorial"> {/*englobará o card que contém o tutorial*/}
                
                <div className="card-tutorial-header">
                    <span className="dot dot-red"></span> {/*bolinhas coloridas da parte superior do card*/}
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                    <h2>{currentSlide.title}</h2>
                </div> 
            
            
            <p>{currentSlide.text}</p>  
            
            </div>

            <button className={nextButtonClass} onClick ={ () => {
                if (slideIndex < 4) {
                setSlideIndex(slideIndex + 1);
                }
            
            }}
            ><FaCircleChevronRight/></button>

            </div>


             <div className="progress-bar-tutorial">

                {slides.map ((slide, i) => <span className={getDotClass(i)} key={i}></span> ) }
             </div>

            <div className="finish-button-wrapper">
                {finishButton}
            </div>

            <img src={logo} alt="theCoders Cases" className="tutorial-logo"/>
        
        </div>

    );

}

export default Tutorial;
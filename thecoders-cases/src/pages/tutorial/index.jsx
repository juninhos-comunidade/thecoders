import logo from "../../assets/logo.svg";
import { useState } from "react";
import "./index.css"

const slides = [
    {titulo: "Boas vindas ao theCoders Cases!", texto: "Esse espaço foi pensado especialmente para quem está começando na área de TI e quer treinar na prática. Aqui você vai simular cases reais, em grupo, como os que costumam aparecer em processos seletivos, uma forma de ganhar confiança e experiência antes da entrevista de verdade."},
    {titulo: "Como funciona o case", texto: "Quando você clicar em 'Começar', vamos te levar automaticamente para a sala de case mais adequada para o seu nível de expertise e nível de dificuldade atual. Assim que o case aparecer na tela, o cronômetro começa a contar, mas o tempo é seu para usar como quiser."},
    {titulo: "Como funciona o case", texto: "Nossa dica: divida esse tempo em algumas etapas, como leitura do case, entendimento do problema, definição do que cada pessoa do grupo vai fazer, e por fim a apresentação da solução. Quando o tempo acabar, o case é encerrado automaticamente e parte para a avaliação."},
    {titulo: "Avaliação e confidencialidade", texto: "Ao final de cada case, uma IA faz uma avaliação do seu desempenho individual, mas fica tranquilo(a): essa avaliação é só um apoio para o seu aprendizado, ela não substitui a análise de um profissional real. E o mais importante: seus resultados e desempenho são confidenciais. Eles não são divulgados para ninguém, nem para outros participantes, nem para empresas. Servem só como dado educacional, de uso exclusivamente seu, para você acompanhar sua própria evolução."},
    {titulo: "Como funciona a evolução de nível", texto: "Você começa como Estagiário, com acesso liberado aos cases fáceis e médios. Conforme você vai completando cases, vai ganhando XP e, ao acumular XP suficiente, sobe automaticamente para o nível Junior. Ao virar Junior, você desbloqueia os cases difíceis e pode seguir treinando entre médios e difíceis, no seu ritmo."}
]




function Tutorial () { const [slideIndex, setSlideIndex] = useState(0);
    const currentSlide = slides[slideIndex];
    return (
        <div className="tutorial-container"> {/*englobará tudo: card, botoes, etc*/}
            <button onClick ={ () => {
                if (slideIndex < 4) {
                setSlideIndex(slideIndex + 1);
                }
            
            }}
            >avançar</button>

            <button onClick ={ () => 
                {
                    if (slideIndex > 0) {
                        setSlideIndex(slideIndex - 1);
                }
                }}>voltar</button>

            <div className="card-tutorial"> {/*englobará o card que contém o tutorial*/}
                
                <div className="card-tutorial-header">
                    <span className="dot dot-red"></span> {/*bolinhas coloridas da parte superior do card*/}
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                </div> 
            
            <h2>{currentSlide.titulo}</h2>
            <p>{currentSlide.texto}</p>  
            
            </div>

             <div className="progress-bar-tutorial">

                {slides.map ((slide, i) => <span className="progress-dot" key={i}></span> ) }
             </div>

            <img src={logo} alt="theCoders Cases"/>
        
        </div>

    );

}

export default Tutorial;
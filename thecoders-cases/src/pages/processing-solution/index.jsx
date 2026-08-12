import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./index.css";
import ampulheta from "../../assets/ampulheta.svg";
import { API_BASE_URL } from "../../config/api";

const TEMPO_MINIMO_ANIMACAO_SEGUNDOS = 5;

export default function ProcessingSolution() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuarioId, usuarioNome, caseId, salaId, solucaoEnviada } = location.state || {};

  const [secondsLeft, setSecondsLeft] = useState(TEMPO_MINIMO_ANIMACAO_SEGUNDOS);

  // Controla a corrida entre a animação (mínimo de 5s, por UX) e a resposta real
  // da API: só navegamos para /last-result quando as duas tiverem terminado.
  const animacaoConcluidaRef = useRef(false);
  const avaliacaoRef = useRef({ concluida: false, resultado: null, erro: null });
  const jaNavegouRef = useRef(false);

  const statusIcons = {
    done: "✓",
    pending: "⏳",
    final: "🎉",
  };

  const tentarNavegar = () => {
    if (jaNavegouRef.current) return;
    if (!animacaoConcluidaRef.current || !avaliacaoRef.current.concluida) return;

    jaNavegouRef.current = true;

    if (avaliacaoRef.current.erro) {
      navigate("/lobby", {
        state: {
          usuarioId,
          usuarioNome,
          aviso:
            "Não foi possível avaliar sua solução agora. Tente novamente em instantes.",
        },
      });
      return;
    }

    navigate("/last-result", {
      state: { resultado: avaliacaoRef.current.resultado, usuarioId, usuarioNome },
    });
  };

  // Contagem regressiva visual (não passa de 1s caso a avaliação ainda não tenha voltado).
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          animacaoConcluidaRef.current = true;
          tentarNavegar();
          return avaliacaoRef.current.concluida ? 0 : 1;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chamada real ao endpoint de avaliação por IA (B09).
  useEffect(() => {
    if (!usuarioId || !caseId || !salaId || !solucaoEnviada) {
      avaliacaoRef.current = {
        concluida: true,
        resultado: null,
        erro: "dados_ausentes",
      };
      animacaoConcluidaRef.current = true;
      tentarNavegar();
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        const resposta = await fetch(`${API_BASE_URL}/avaliacao`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: usuarioId,
            case_id: caseId,
            sala_id: salaId,
            solucao_enviada: solucaoEnviada,
          }),
        });

        if (cancelado) return;

        if (!resposta.ok) {
          avaliacaoRef.current = { concluida: true, resultado: null, erro: "http" };
          tentarNavegar();
          return;
        }

        const resultado = await resposta.json();
        avaliacaoRef.current = { concluida: true, resultado, erro: null };
        tentarNavegar();
      } catch {
        if (cancelado) return;
        avaliacaoRef.current = { concluida: true, resultado: null, erro: "rede" };
        tentarNavegar();
      }
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, caseId, salaId, solucaoEnviada]);

  return (
    <div className="processing-page">
      <div className="processing-screen">
        <header className="processing-header">
          <h1>Processando sua solução...</h1>
        </header>

        <div className="processing-layout">
          <div className="processing-status">
            <ul className="status-list">
              <li className="status-item done">
                <span className="status-icon">{statusIcons.done}</span>
                <span>Solução enviada</span>
              </li>

              <li className="status-item">
                <span className="status-icon"> </span>
                <span>Nossa IA está avaliando sua resolução</span>
              </li>

              <li className="status-item">
                <span className="status-icon"> </span>
                <span>Analisando...</span>
              </li>

              <li className="status-item done">
                <span className="status-icon">{statusIcons.done}</span>
                <span>Entendimento do problema</span>
              </li>

              <li className="status-item done">
                <span className="status-icon">{statusIcons.done}</span>
                <span>Estrutura da solução</span>
              </li>

              <li className="status-item pending">
                <span className="status-icon">{statusIcons.pending}</span>
                <span>Avaliando justificativa...</span>
              </li>

              <li className="status-item pending">
                <span className="status-icon">{statusIcons.pending}</span>
                <span>Comparando com solução referência...</span>
              </li>

              <li className="status-item pending">
                <span className="status-icon">{statusIcons.pending}</span>
                <span>Gerando feedback...</span>
              </li>

              <li className="status-item dots">
                <span className="status-icon empty">.</span>
                <span className="status-placeholder">.</span>
              </li>

              <li className="status-item dots">
                <span className="status-icon empty">.</span>
                <span className="status-placeholder">.</span>
              </li>

              <li className="status-item dots">
                <span className="status-icon empty">.</span>
                <span className="status-placeholder">.</span>
              </li>

              <li className="status-item final">
                <span className="status-icon trophy">{statusIcons.final}</span>
                <span>Parabéns! Sua solução foi avaliada.</span>
              </li>
            </ul>

            <div className="timer-out-page">
              <span>Redirecionando em</span>
              <span>{secondsLeft}s</span>
            </div>
          </div>

          <div className="hourglass-scene">
            <img src={ampulheta} alt="Ampulheta de carregamento" />
          </div>
        </div>
      </div>
    </div>
  );
}
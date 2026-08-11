import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import btnApple from "../../assets/apple.png";
import btnGoogle from "../../assets/google.png.png";    
import btnLinkedIn from "../../assets/linkedin.png";
import ilustracao from "../../assets/image.png";
import logo from "../../assets/logo.svg";
import { API_BASE_URL } from "../../config/api";
import "./index.css";

const REDES = [
    {
        nome: "Google",
        icone: <img src={btnGoogle} alt="Google" className="icone-social" />,
    },
    {
        nome: "Apple",
        icone: <img src={btnApple} alt="Apple" className="icone-social" />,
    },
    {
        nome: "LinkedIn",
        icone: <img src={btnLinkedIn} alt="LinkedIn" className="icone-social" />,
    },
];

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [visivel, setVisivel] = useState(false);
    const [erro, setErro] = useState("");

    const autenticar = async (e) => {
        e.preventDefault();

        try {
            const resposta = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            });

            if (!resposta.ok) {
                setErro("E-mail ou senha incorretos");
                return;
            }

            const usuario = await resposta.json();
            const state = { usuarioId: usuario.id, usuarioNome: usuario.nome_completo };

            setErro("");

            if (usuario.primeiro_login) {
                navigate("/tutorial", { state });
            } else {
                navigate("/lobby", { state });
            }
        } catch (err) {
            setErro("Não foi possível conectar ao servidor");
        }
    };

    return (
        <div className="pagina-login">
            <section className="coluna-apresentacao">
                <div className="marca">
                    <img src={logo} alt="theCoders CASES" className="marca-logo" />
                </div>

                <h1>
                    Resolva desafios
                    <br />
                    Evolua como desenvolvedor
                </h1>
                <p>
                    Resolva cases reais de tecnologia, receba avaliações e se desenvolva
                    para o mercado.
                </p>

                <img src={ilustracao} alt="Ilustração Dev" className="ilustracao" />
            </section>

            <section className="coluna-login">
                <div className="card-login">
                    <h2>Login</h2>
                    <p className="subtitulo">se conecte com</p>

                    <div className="botoes-sociais">
                        {REDES.map(({ nome, icone }) => (
                            <button
                                key={nome}
                                type="button"
                                onClick={() => console.log(`Login com ${nome}`)}
                            >
                                {icone}
                                {nome}
                            </button>
                        ))}
                    </div>

                    <div className="divisor">
                        <span>ou</span>
                    </div>

                    <form onSubmit={autenticar}>
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                        />
                        
                        <div className="campo-senha">
                            <input
                                type={visivel ? "text" : "password"}
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="botao-olho"
                                onClick={() => setVisivel((v) => !v)}
                                aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {erro && <p className="mensagem-erro">{erro}</p>}

                        <button type="submit" className="btn-entrar">
                            Entrar
                        </button>
                    </form>

                    <div className="links-auxiliares">
                        <p>
                            Esqueceu sua senha? <a href="/recuperar">Recupere</a>
                        </p>
                        <p>
                            Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
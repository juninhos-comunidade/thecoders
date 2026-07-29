import { useState } from "react";
import btnApple from "../../assets/btnApple.svg";
import btnGoogle from "../../assets/btnGoogle.svg";
import btnLinkedIn from "../../assets/btnLinkedIn.svg";
import logo from "../../assets/logo.svg";
import "./index.css";

const REDES = [
	{nome: "Google", icone: <img src={btnGoogle} alt="Google" /> },
	{nome: "Apple", icone: <img src={btnApple} alt="Apple" /> },
	{nome: "LinkedIn", icone: <img src={btnLinkedIn} alt="LinkedIn" /> },
];

export default function Login() {
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");

	const autenticar = (e) => {
		e.preventDefault();
		console.log({ email, senha });
	};

	return (
		<div className="pagina-login">
			<section className="coluna-apresentacao">
				<div className="marca">
					<img src={logo} alt="theCoders" className="marca-logo" />
					<span className="marca-nome">
						
					</span>
				</div>

				<h1>
					Resolva desafios
					<br />
					Evolua como desenvolvedor
				</h1>
				<p>Resolva cases reais de tecnologia, receba avaliações e se desenvolva para o mercado.</p>
				
			</section>

			<section className="coluna-login">
				<div className="card-login">
					<h2>Login</h2>
					<p className="subtitulo">se conecte com</p>

					<div className="botoes-sociais">
						{REDES.map(({ nome, icone }) => (
							<button key={nome} type="button" onClick={() => console.log(`Login com ${nome}`)}>
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
						<input
							type="password"
							placeholder="Senha"
							value={senha}
							onChange={(e) => setSenha(e.target.value)}
							autoComplete="current-password"
						/>
						<button type="submit" className="btn-entrar">Entrar</button>
					</form>

					<div className="links-auxiliares">
						<p>Esqueceu sua senha? <a href="/recuperar">Recupere</a></p>
						<p>Não tem uma conta? <a href="/cadastro">Cadastre-se</a></p>
					</div>
				</div>
			</section>
		</div>
	);
}
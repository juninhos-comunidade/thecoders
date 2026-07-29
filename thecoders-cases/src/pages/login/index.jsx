import logo from "../../assets/logo.svg";
import { useState } from "react";

// import { useLocation } from "react-router-dom";

export default function Login() {
	// const navigate = useLocation();

	const [email, setEmail] = useState("admin@admin.com");
	const [senha, setSenha] = useState("123456");

	const autenticar = () => {
	};

	return (
		<div className="caixa-login">
			<div className="logo">
				<img src={logo} alt="Logo" />
			</div>

			<div className="titulo-login">
				<h1>Bem-vind@!</h1>
				<p>Acesse sua conta e continue sua jornada.</p>
			</div>

			

			<div className="grupo">
				<label htmlFor="email">E-mail</label>
				<input
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="text"
					placeholder="Digite seu e-mail"
				/>
			</div>

			<div className="grupo">
				<label htmlFor="senha">Senha</label>
				<input
					id="senha"
					value={senha}
					onChange={(e) => setSenha(e.target.value)}
					type="password"
					placeholder="Digite sua senha"
				/>
			</div>

			<div className="btn-entrar">
				<button id="btn-entrar" onClick={autenticar}>
					Entrar
				</button>
			</div>
		</div>
	);
}
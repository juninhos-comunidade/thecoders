import { useState } from "react";
import logo from "../../assets/logo.svg";
import "./index.css";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const emailLimpo = email.trim();
    if (!emailLimpo) {
      return alert("Digite um e-mail!");
    }

    console.log("Enviado link para:", emailLimpo);
    alert(`Enviado link de recuperação para: ${emailLimpo}`);
  };

  return (
    <div className="pagina-esqueci-senha">
      <img src={logo} alt="theCoders CASES" className="logo" />

      <div className="card">
        <h2>Esqueci minha senha</h2>
        <p>
          Digite o e-mail que você usa aqui na Thecoders. Se ele estiver
          cadastrado, você receberá um link para recuperar seu acesso em instantes.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar Link</button>
        </form>

        <a href="/">Voltar para o login</a>
      </div>
    </div>
  );
}
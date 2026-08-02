import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./index.css";
import logo from "../../assets/logo.svg";


const CAMPOS_INICIAIS = {
  nome: "",
  nomeSocial: "",
  cpf: "",
  souEstrangeiro: false,
  email: "",
  confirmarEmail: "",
  senha: "",
  confirmarSenha: "",
};

function Campo({ label, ajuda, erro, ...inputProps }) {
  return (
    <div className="campo">
      <label htmlFor={inputProps.id}>{label}</label>
      <input {...inputProps} className={erro ? "erro" : ""} />
      {ajuda && <p className="campo-ajuda">{ajuda}</p>}
      {erro && <p className="campo-erro">{erro}</p>}
    </div>
  );
}

function CampoSenha({ label, ajuda, erro, ...inputProps }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="campo">
      <label htmlFor={inputProps.id}>{label}</label>
      <div className="campo-senha">
        <input
          {...inputProps}
          type={visivel ? "text" : "password"}
          className={erro ? "erro" : ""}
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
      {erro && <p className="campo-erro">{erro}</p>}
    </div>
  );
}

export default function CadastroPage() {
  const [form, setForm] = useState(CAMPOS_INICIAIS);
  const [erros, setErros] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: undefined }));
  }

  function HandleSubmit(e) {
    e.preventDefault();

    const novosErros = {};
    if (
      form.email.trim().toLowerCase() !==
      form.confirmarEmail.trim().toLowerCase()
    ) {
      novosErros.confirmarEmail = "Os e-mails não coincidem.";
    }
    if (form.senha !== form.confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    console.log("Dados do cadastro:", form);
  }

  return (
    <div className="cadastro-wrapper">

      <main className="cadastro-main">
        <div className="cadastro-logo">
        <img src={logo} alt="theCoders CASES" />
        </div>
        

        <form className="cadastro-card" onSubmit={HandleSubmit}>
          <Campo
            id="nome"
            name="nome"
            label="Nome"
            placeholder="Digite seu nome completo"
            value={form.nome}
            onChange={handleChange}
            required
          />

          <Campo
            id="nomeSocial"
            name="nomeSocial"
            label="Nome Social"
            placeholder="Digite como você prefere que as pessoas te chamem"
            value={form.nomeSocial}
            onChange={handleChange}
            ajuda="Este campo é opcional. Se você for uma pessoa trans, conte para a gente como prefere que as pessoas te chamem."
          />

          <Campo
            id="cpf"
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={handleChange}
            disabled={form.souEstrangeiro}
            required={!form.souEstrangeiro}
          />

          <label className="checkbox-linha" htmlFor="souEstrangeiro">
            <input
              id="souEstrangeiro"
              name="souEstrangeiro"
              type="checkbox"
              checked={form.souEstrangeiro}
              onChange={handleChange}
            />
            Sou estrangeiro
          </label>

          <Campo
            id="email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="Digite o e-mail que você mais usa"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Campo
            id="confirmarEmail"
            name="confirmarEmail"
            type="email"
            label="Confirmar e-mail"
            placeholder="Confirme o seu e-mail"
            value={form.confirmarEmail}
            onChange={handleChange}
            erro={erros.confirmarEmail}
            aria-invalid={Boolean(erros.confirmarEmail)}
            required
          />

          <CampoSenha
            id="senha"
            name="senha"
            label="Senha"
            placeholder="Crie uma nova senha"
            value={form.senha}
            onChange={handleChange}
            required
          />

          <CampoSenha
            id="confirmarSenha"
            name="confirmarSenha"
            label="Confirmar a senha"
            placeholder="Confirme sua nova senha"
            value={form.confirmarSenha}
            onChange={handleChange}
            erro={erros.confirmarSenha}
            aria-invalid={Boolean(erros.confirmarSenha)}
            required
          />

          <div className="cadastro-acao">
            <button type="submit" className="botao-criar-conta">
              Criar conta
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
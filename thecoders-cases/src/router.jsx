import Login from "./pages/login";
import EsqueciSenha from "./pages/esqueci-senha";
import CadastroPage from "./pages/cadastro"; // ajuste o caminho conforme onde você salvou o arquivo

import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/recuperar" element={<EsqueciSenha />} />
				<Route path="/cadastro" element={<CadastroPage />} />
				{/* <Route path="/lobby" element={<Lobby />} /> */}
			</Routes>
		</BrowserRouter>
	);
}
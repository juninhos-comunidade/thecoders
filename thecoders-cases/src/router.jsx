import Login from "./pages/login";
import Tutorial from "./pages/tutorial";
import EsqueciSenha from "./pages/esqueci-senha";
import CadastroPage from "./pages/cadastro";
import Lobby from "./pages/lobby";
import OnCase from "./pages/on-case";
import LastResult from "./pages/last-result";
import ProcessingSolution from "./pages/processing-solution";



import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/tutorial" element={<Tutorial />} />
				<Route path="/recuperar" element={<EsqueciSenha />} />
				<Route path="/cadastro" element={<CadastroPage />} />
				<Route path="/lobby" element={<Lobby />} />
				<Route path="/on-case" element={<OnCase />} />
				<Route path="/last-result" element={<LastResult />} />
				<Route path="/processing-solution" element={<ProcessingSolution />} />
			</Routes>
		</BrowserRouter>
	);
}
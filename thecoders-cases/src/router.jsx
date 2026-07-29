import Login from "./pages/login";

import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				{/* <Route path="/lobby" element={<Lobby />} /> */}
			</Routes>
		</BrowserRouter>
	);
}
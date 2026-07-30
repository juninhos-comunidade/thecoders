import "./index.css";
import ProfileIcon from "../profile-icon";
import Nivel from "../niveis";
import logo from "../../assets/logo.svg";

export default function Navbar({ nivel }) {
	return (
		<nav className="navbar">
			<div className="left">
				<div className="logo">
					<img src={logo} alt="theCoders" />
				</div>
			</div>

			<div className="right">
				<Nivel level={nivel} /> 
				<ProfileIcon />
			</div>
		</nav>
	);
}

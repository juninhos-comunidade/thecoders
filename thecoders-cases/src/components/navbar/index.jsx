import "./index.css";
import ProfileIcon from "../profile-icon";
import Nivel from "../niveis";
import logo from "../../assets/logo.svg";
import Buttons from "../buttons";

export default function Navbar({ nivel }) {
	return (
		<nav className="navbar">
			<div className="left">
				<div className="logo">
					<img src={logo} alt="theCoders" />
				</div>
			</div>

			<div className="right">
				<Buttons label="Tutorial" page="/tutorial" />
				<Nivel level={nivel} /> 
				<ProfileIcon />
			</div>
		</nav>
	);
}

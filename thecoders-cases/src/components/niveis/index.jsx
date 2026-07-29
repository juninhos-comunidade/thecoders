import "./index.css";

export default function Nivel({ item }) {
	const letra = item?.nivel ?? "E";

	return (
		<div className="nivel-card" data-node-id="107:354" data-name="Nível">
			<p className="nivel-letra" data-node-id="107:355">
				{letra}
			</p>
		</div>
	);
}

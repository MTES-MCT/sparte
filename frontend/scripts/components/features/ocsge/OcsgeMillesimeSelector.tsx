import React from "react";
import { MillesimeByIndex } from "@services/types/land";

interface OcsgeMillesimeSelectorProps {
	index: number;
	setIndex: (index: number) => void;
	byDepartement: boolean;
	setByDepartement: (byDepartement: boolean) => void;
	millesimes_by_index: MillesimeByIndex[];
	shouldDisplayByDepartementBtn: boolean;
}

export const OcsgeMillesimeSelector: React.FC<OcsgeMillesimeSelectorProps> = ({
	index,
	setIndex,
	byDepartement,
	setByDepartement,
	millesimes_by_index,
	shouldDisplayByDepartementBtn,
}) => (
	<ul className="fr-btns-group fr-btns-group--inline-sm">
		{millesimes_by_index.map((m) => (
			<li key={m.years}>
				<button
					type="button"
					className={`fr-btn ${m.index !== index ? "fr-btn--tertiary" : ""}`}
					onClick={() => setIndex(m.index)}
					title={m.years}
				>
					{shouldDisplayByDepartementBtn ? `Millésime n°${m.index}` : m.years}
				</button>
			</li>
		))}
		{shouldDisplayByDepartementBtn && (
			<li>
				<button
					onClick={() => setByDepartement(!byDepartement)}
					type="button"
					className="fr-btn fr-btn--tertiary"
				>
					<p>
						<span>
							{byDepartement
								? "Afficher par groupe de millésime"
								: "Afficher par département"}
						</span>
						&nbsp;
						<i
							className="bi bi-info-circle"
							aria-describedby="tooltip-multi-dpt"
							data-fr-js-tooltip-referent="true"
						/>
						<span 
							id="tooltip-multi-dpt" 
							className="fr-tooltip fr-placement" 
							role="tooltip" 
							aria-hidden="true"
						>
							{byDepartement
								? "Ce mode rassemble les données par groupe d'années, ce qui permet d'afficher une vue d'ensemble"
								: "Ce mode distingue les données par département, ce qui permet de ne pas mélanger les données issues d'années différentes"
							}
						</span>
					</p>
				</button>
			</li>
		)}
	</ul>
); 
import React from "react";

interface DepartmentSelectorProps {
	byDepartement: boolean;
	setByDepartement: (byDepartement: boolean) => void;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
	byDepartement,
	setByDepartement,
}) => {
	return (
		<ul className="fr-btns-group fr-btns-group--inline-sm">
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
		</ul>
	);
};

import React from "react";
import Button from "@components/ui/Button";

interface DepartmentSelectorProps {
	byDepartement: boolean;
	setByDepartement: (byDepartement: boolean) => void;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
	byDepartement,
	setByDepartement,
}) => {
	return (
		<div className="d-flex gap-2" style={{ flexWrap: "wrap", background: "white", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", width: "fit-content" }}>
			<Button
				onClick={() => setByDepartement(!byDepartement)}
				type="button"
				variant="secondary"
				size="sm"
			>
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
			</Button>
		</div>
	);
};

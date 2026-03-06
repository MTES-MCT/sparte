import React from "react";
import Button from "@components/ui/Button";
import styled from "styled-components";
import { theme } from "@theme";

const Container = styled.div`
	display: flex;
	gap: ${theme.spacing.sm};
`;

interface DepartmentSelectorProps {
	byDepartement: boolean;
	setByDepartement: (byDepartement: boolean) => void;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
	byDepartement,
	setByDepartement,
}) => {
	return (
		<Container>
			<Button
				onClick={() => setByDepartement(!byDepartement)}
				type="button"
				variant="tertiary"
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
		</Container>
	);
};

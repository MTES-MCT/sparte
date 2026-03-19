import React from "react";
import styled from "styled-components";
import Button from "@components/ui/Button";
import { getLandTypeLabel } from "@utils/landUtils";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

const ControlLabel = styled.span`
	font-weight: 500;
	font-size: 0.8rem;
	flex-shrink: 0;

	@media (max-width: 1280px) {
		display: none;
	}
`;

export const ArtifControls: React.FC = () => {
	const {
		childLandTypes,
		childLandType,
		setChildLandType,
	} = useArtificialisationContext();

	if (!childLandTypes || childLandTypes.length <= 1) return null;

	return (
		<div className="d-flex align-items-center gap-2">
			<ControlLabel>
				<i className="bi bi-grid-3x3-gap fr-mr-1v" aria-hidden="true" />
				Maille d'analyse
			</ControlLabel>
			{childLandTypes.map((type) => (
				<Button
					key={type}
					variant={childLandType === type ? "primary" : "secondary"}
					size="sm"
					onClick={() => setChildLandType(type)}
				>
					{getLandTypeLabel(type)}
				</Button>
			))}
		</div>
	);
};

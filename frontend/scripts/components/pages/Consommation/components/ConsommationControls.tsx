import React from "react";
import styled from "styled-components";
import Button from "@components/ui/Button";
import PeriodSelector from "@components/ui/PeriodSelector";
import { useConsommationControls } from "../context/ConsommationControlsContext";

const ControlLabel = styled.span`
	font-weight: 500;
	font-size: 0.8rem;
	flex-shrink: 0;

	@media (max-width: 1280px) {
		display: none;
	}
`;

const Separator = styled.span`
	padding: 0.1rem;
	color: var(--artwork-motif-blue-france);
`;

export const ConsommationControls: React.FC = () => {
	const {
		startYear,
		endYear,
		setStartYear,
		setEndYear,
		minYear,
		maxYear,
		defaultStartYear,
		defaultEndYear,
		childLandTypes,
		childType,
		setChildType,
		landTypeLabels,
	} = useConsommationControls();

	const hasChangedFromDefault = startYear !== defaultStartYear || endYear !== defaultEndYear;

	const handleReset = () => {
		setStartYear(defaultStartYear);
		setEndYear(defaultEndYear);
	};

	return (
		<div className="d-flex align-items-center gap-3">
			<ControlLabel>
				Période d'analyse
			</ControlLabel>

			<div className="d-flex align-items-center gap-2">
				<PeriodSelector
					startYear={startYear}
					endYear={endYear}
					minYear={minYear}
					maxYear={maxYear}
					onStartYearChange={setStartYear}
					onEndYearChange={setEndYear}
				/>

				{hasChangedFromDefault && (
					<Button
						onClick={handleReset}
						variant="secondary"
						size="sm"
						icon="bi bi-arrow-clockwise"
						title={`Réinitialiser à la période ${defaultStartYear}-${defaultEndYear}`}
					/>
				)}

				{childLandTypes && childLandTypes.length > 1 && (
					<>
						<Separator>|</Separator>
						<ControlLabel>
							<i className="bi bi-grid-3x3-gap fr-mr-1v" aria-hidden="true" />
							Maille d'analyse
						</ControlLabel>
						{childLandTypes.map((type) => (
							<Button
								key={type}
								variant={childType === type ? "primary" : "secondary"}
								size="sm"
								onClick={() => setChildType(type)}
							>
								{landTypeLabels[type] || type}
							</Button>
						))}
					</>
				)}
			</div>
		</div>
	);
};

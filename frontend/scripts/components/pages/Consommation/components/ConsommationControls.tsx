import React from "react";
import styled from "styled-components";
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

	const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

	const hasChangedFromDefault = startYear !== defaultStartYear || endYear !== defaultEndYear;

	const handleReset = () => {
		setStartYear(defaultStartYear);
		setEndYear(defaultEndYear);
	};

	const controlsContent = (
		<div className="d-flex align-items-center gap-3">
			<ControlLabel>
				Période d'analyse
			</ControlLabel>

			<div className="d-flex align-items-center gap-2">
				<select
					className="fr-select fr-select--sm"
					id="start-year"
					value={startYear}
					onChange={(e) => setStartYear(Number(e.target.value))}
					aria-label="Année de début"
				>
					{yearOptions.map((year) => (
						<option key={year} value={year} disabled={year >= endYear}>
							{year}
						</option>
					))}
				</select>

				<Separator>-</Separator>

				<select
					className="fr-select fr-select--sm"
					id="end-year"
					value={endYear}
					onChange={(e) => setEndYear(Number(e.target.value))}
					aria-label="Année de fin"
				>
					{yearOptions.map((year) => (
						<option key={year} value={year} disabled={year <= startYear}>
							{year}
						</option>
					))}
				</select>

				{hasChangedFromDefault && (
					<button
						onClick={handleReset}
						className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-refresh-line flex-shrink-0"
						title={`Réinitialiser à la période ${defaultStartYear}-${defaultEndYear}`}
					>
					</button>
				)}

				{childLandTypes && childLandTypes.length > 1 && (
					<>
						<Separator>|</Separator>
						<ControlLabel>
							Maille d'analyse
						</ControlLabel>
						<select
							className="fr-select fr-select--sm"
							id="child-type"
							value={childType || ''}
							onChange={(e) => setChildType(e.target.value)}
							aria-label="Maille d'analyse"
						>
							{childLandTypes.map((type) => (
								<option key={type} value={type}>
									{landTypeLabels[type] || type}
								</option>
							))}
						</select>
					</>
				)}
			</div>
		</div>
	);

	return controlsContent;
};

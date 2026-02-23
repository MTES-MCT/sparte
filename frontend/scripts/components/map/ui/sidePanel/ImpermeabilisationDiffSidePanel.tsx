import React from "react";
import type maplibregl from "maplibre-gl";
import { IMPERMEABILISATION_MATRIX } from "../../constants/ocsge_nomenclatures";
import { OcsgeDiffSidePanel, OcsgeDiffConfig } from "./OcsgeDiffSidePanel";

const IMPER_CONFIG: OcsgeDiffConfig = {
	id: "imper",
	positiveField: "new_is_impermeable",
	negativeField: "new_not_impermeable",
	positiveLabel: "Imperméabilisation",
	negativeLabel: "Désimperméabilisation",
	matrix: IMPERMEABILISATION_MATRIX,
	matrixPositiveLabel: "Imperméable",
	matrixNegativeLabel: "Non imperméable",
	seuilText: (oldPositive, isPositive) =>
		`Les couvertures avant et après sont toutes deux classées « ${oldPositive ? "imperméable" : "non imperméable"} » par la matrice. Cette ${isPositive ? "imperméabilisation" : "désimperméabilisation"} est détectée par les`,
};

export interface ImpermeabilisationDiffSidePanelProps {
	feature: maplibregl.MapGeoJSONFeature | null;
	isLocked: boolean;
	onClose: () => void;
}

export const ImpermeabilisationDiffSidePanel: React.FC<ImpermeabilisationDiffSidePanelProps> = (props) => (
	<OcsgeDiffSidePanel {...props} config={IMPER_CONFIG} />
);

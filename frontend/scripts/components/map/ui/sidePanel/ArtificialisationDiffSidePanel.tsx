import React from "react";
import type maplibregl from "maplibre-gl";
import { ARTIFICIALISATION_MATRIX } from "../../constants/ocsge_nomenclatures";
import { OcsgeDiffSidePanel, OcsgeDiffConfig } from "./OcsgeDiffSidePanel";

const ARTIF_CONFIG: OcsgeDiffConfig = {
	id: "artif",
	positiveField: "new_is_artificial",
	negativeField: "new_not_artificial",
	positiveLabel: "Artificialisation",
	negativeLabel: "Désartificialisation",
	matrix: ARTIFICIALISATION_MATRIX,
	matrixPositiveLabel: "Artificialisé",
	matrixNegativeLabel: "Non artificialisé",
	seuilText: (oldPositive, isPositive) =>
		`Les couvertures/usages avant et après sont tous deux classés « ${oldPositive ? "artificialisé" : "non artificialisé"} » par la matrice OCS GE. Cette ${isPositive ? "artificialisation" : "désartificialisation"} est détectée par les`,
};

export interface ArtificialisationDiffSidePanelProps {
	feature: maplibregl.MapGeoJSONFeature | null;
	isLocked: boolean;
	onClose: () => void;
}

export const ArtificialisationDiffSidePanel: React.FC<ArtificialisationDiffSidePanelProps> = (props) => (
	<OcsgeDiffSidePanel {...props} config={ARTIF_CONFIG} />
);

import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";
import { ArtificialisationPopup } from "./popup/ArtificialisationPopup";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getLastMillesimeIndex, getFirstDepartement } from "../utils/ocsge";

interface ArtificialisationMapProps {
	landData: LandDetailResultType;
}

export const ArtificialisationMap: React.FC<ArtificialisationMapProps> = ({
  	landData,
}) => {
    const lastMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
    const firstDepartement = getFirstDepartement(landData.departements);

    const config = defineMapConfig({
		sources: [
			...BASE_SOURCES,
			{ type: "ocsge" },
		],
		layers: [
			...BASE_LAYERS,
            { type: "artificialisation", stats: true },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: "artificialisation-group",
				label: "Surfaces artificialisées",
				description: "La mesure de l'artificialisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Echelle). Ce calque permet de visualiser les surfaces artificialisées sur un territoire.",
				controls: [
					{
						id: "artificialisation-visibility",
						type: "visibility",
						targetLayers: ["artificialisation-layer"],
						defaultValue: true
					},
					{
						id: "artificialisation-opacity",
						type: "opacity",
						targetLayers: ["artificialisation-layer"],
						defaultValue: 0.7
					},
					{
						id: "artificialisation-millesime",
						type: "ocsge-millesime",
						targetLayers: ["artificialisation-layer"],
						sourceId: "ocsge-source",
						defaultValue: `${lastMillesimeIndex}_${firstDepartement}`
					},
					{
						id: "artificialisation-nomenclature",
						type: "ocsge-nomenclature",
						targetLayers: ["artificialisation-layer"],
						linkedFilterId: "artificialisation-filter",
						defaultValue: "couverture"
					},
					{
						id: "artificialisation-filter",
						type: "ocsge-nomenclature-filter",
						targetLayers: ["artificialisation-layer"],
						defaultValue: OCSGE_LAYER_NOMENCLATURES.artificialisation.couverture
					}
				]
			}
		],
		popups: [
			{
				layerId: "artificialisation-layer",
				trigger: "hover",
				title: "Surfaces artificialisées",
				renderContent: (feature) => <ArtificialisationPopup feature={feature} />,
			}
		]
    });

	return (
		<BaseMap
			id="artificialisation-map"
			config={config}
			landData={landData}
		/>
	);
};


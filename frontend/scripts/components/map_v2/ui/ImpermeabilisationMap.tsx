import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";
import { ImpermeabilisationPopup } from "./popup/ImpermeabilisationPopup";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getLastMillesimeIndex, getFirstDepartement } from "../utils/ocsge";

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
}

export const ImpermeabilisationMap: React.FC<ImpermeabilisationMapProps> = ({
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
            { type: "impermeabilisation", stats: true },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: "impermeabilisation-group",
				label: "Imperméabilisation",
				description: "Surfaces imperméabilisées basée sur l'occupation du sol (OCS GE). Seules les zones imperméables sont affichées.",
				controls: [
					{
						id: "impermeabilisation-visibility",
						type: "visibility",
						targetLayers: ["impermeabilisation-layer"],
						defaultValue: true
					},
					{
						id: "impermeabilisation-opacity",
						type: "opacity",
						targetLayers: ["impermeabilisation-layer"],
						defaultValue: 0.7
					},
					{
						id: "impermeabilisation-millesime",
						type: "ocsge-millesime",
						targetLayers: ["impermeabilisation-layer"],
						sourceId: "ocsge-source",
						defaultValue: `${lastMillesimeIndex}_${firstDepartement}`
					},
					{
						id: "impermeabilisation-nomenclature",
						type: "ocsge-nomenclature",
						targetLayers: ["impermeabilisation-layer"],
						linkedFilterId: "impermeabilisation-filter",
						defaultValue: "couverture"
					},
					{
						id: "impermeabilisation-filter",
						type: "ocsge-nomenclature-filter",
						targetLayers: ["impermeabilisation-layer"],
						defaultValue: OCSGE_LAYER_NOMENCLATURES.impermeabilisation.couverture
					}
				]
			}
		],
		popups: [
			{
				layerId: "impermeabilisation-layer",
				trigger: "hover",
				title: "Surfaces imperméabilisées",
				renderContent: (feature) => <ImpermeabilisationPopup feature={feature} />,
			}
		]
    });

	return (
		<BaseMap
			id="impermeabilisation-map"
			config={config}
			landData={landData}
		/>
	);
};

import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { ImpermeabilisationDiffInfo } from "./infoPanel/ImpermeabilisationDiffInfo";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getStartMillesimeIndex, getLastMillesimeIndex } from "../utils/ocsge";

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
}

export const ImpermeabilisationDiffMap: React.FC<ImpermeabilisationMapProps> = ({
  	landData,
}) => {
    const startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
    const endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
    
    // Trouver le département du millésime de fin
    const endMillesime = landData.millesimes.find(m => m.index === endMillesimeIndex);
    const defaultDepartement = endMillesime?.departement || landData.departements[0];

    const config = defineMapConfig({
		sources: [
			...BASE_SOURCES,
			{ type: "ocsge-diff" },
			{ type: "ocsge-diff-centroid" },
		],
		layers: [
			...BASE_LAYERS,
            { type: "impermeabilisation-diff", stats: true },
            { type: "impermeabilisation-diff-centroid-cluster" },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: "impermeabilisation-diff-group",
				label: "Imperméabilisation",
				description: "La mesure de l'imperméabilisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Echelle). Ce calque permet de visualiser les surfaces imperméabilisées entre deux millésimes.",
				controls: [
					{
						id: "impermeabilisation-diff-visibility",
						type: "visibility",
						targetLayers: ["impermeabilisation-diff-layer", "impermeabilisation-diff-centroid-cluster"],
						defaultValue: true
					},
					{
						id: "impermeabilisation-diff-opacity",
						type: "opacity",
						targetLayers: ["impermeabilisation-diff-layer"],
						defaultValue: 0.7
					},
					{
						id: "impermeabilisation-diff-millesime",
						type: "ocsge-diff-millesime",
						targetLayers: ["impermeabilisation-diff-layer", "impermeabilisation-diff-centroid-cluster"],
						sourceId: "ocsge-diff-source",
						defaultValue: `${startMillesimeIndex}_${endMillesimeIndex}_${defaultDepartement}`
					}
				]
			}
		],
		infoPanels: [
			{
				layerId: "impermeabilisation-diff-layer",
				title: "Imperméabilisation",
				renderContent: (feature) => <ImpermeabilisationDiffInfo feature={feature} />,
			}
		]
    });

	return (
		<BaseMap
			id="impermeabilisation-diff-map"
			config={config}
			landData={landData}
		/>
	);
};

import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { ArtificialisationDiffInfo } from "./infoPanel/ArtificialisationDiffInfo";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getStartMillesimeIndex, getLastMillesimeIndex } from "../utils/ocsge";

interface ArtificialisationDiffMapProps {
	landData: LandDetailResultType;
}

export const ArtificialisationDiffMap: React.FC<ArtificialisationDiffMapProps> = ({
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
			{ type: "ocsge-artif-diff" },
			{ type: "ocsge-artif-diff-centroid" },
		],
		layers: [
			...BASE_LAYERS,
            { type: "artificialisation-diff", stats: true },
            { type: "artificialisation-diff-centroid-cluster" },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: "artificialisation-diff-group",
				label: "Artificialisation",
				description: "La mesure de l'artificialisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Echelle). Ce calque permet de visualiser les surfaces artificialisées entre deux millésimes.",
				controls: [
					{
						id: "artificialisation-diff-visibility",
						type: "visibility",
						targetLayers: ["artificialisation-diff-layer", "artificialisation-diff-centroid-cluster"],
						defaultValue: true
					},
					{
						id: "artificialisation-diff-opacity",
						type: "opacity",
						targetLayers: ["artificialisation-diff-layer"],
						defaultValue: 0.7
					},
					{
						id: "artificialisation-diff-millesime",
						type: "ocsge-diff-millesime",
						targetLayers: ["artificialisation-diff-layer", "artificialisation-diff-centroid-cluster"],
						sourceId: "ocsge-artif-diff-source",
						defaultValue: `${startMillesimeIndex}_${endMillesimeIndex}_${defaultDepartement}`
					}
				]
			}
		],
		infoPanels: [
			{
				layerId: "artificialisation-diff-layer",
				title: "Artificialisation",
				renderContent: (feature) => <ArtificialisationDiffInfo feature={feature} />,
			}
		]
    });

	return (
		<BaseMap
			id="artificialisation-diff-map"
			config={config}
			landData={landData}
		/>
	);
};


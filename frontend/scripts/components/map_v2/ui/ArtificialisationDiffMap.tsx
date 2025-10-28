import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { ArtificialisationDiffPopup } from "./popup/ArtificialisationDiffPopup";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";

interface ArtificialisationDiffMapProps {
	landData: LandDetailResultType;
}

export const ArtificialisationDiffMap: React.FC<ArtificialisationDiffMapProps> = ({
  	landData,
}) => {
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
				description: "La mesure de l'artificialisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Echelle). Cette carte permet de visualiser les surfaces artificialisées entre deux millésimes.",
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
					}
				]
			}
		],
		popups: [
			{
				layerId: "artificialisation-diff-layer",
				trigger: "hover",
				title: "Artificialisation",
				renderContent: (feature) => <ArtificialisationDiffPopup feature={feature} />,
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


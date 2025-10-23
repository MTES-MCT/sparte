import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { ImpermeabilisationDiffPopup } from "./popup/ImpermeabilisationDiffPopup";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
}

export const ImpermeabilisationDiffMap: React.FC<ImpermeabilisationMapProps> = ({
  	landData,
}) => {
    const config = defineMapConfig({
		sources: [
			...BASE_SOURCES,
			{ type: "ocsge-diff" },
			{ type: "impermeabilisation-diff-centroid" },
		],
		layers: [
			...BASE_LAYERS,
            { type: "impermeabilisation-diff", stats: true },
            { type: "impermeabilisation-diff-centroid-cluster" },
            { type: "impermeabilisation-diff-centroid-cluster-count" },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: "impermeabilisation-diff-group",
				label: "Différence d'imperméabilisation",
				description: "Surfaces imperméabilisées basée sur l'occupation du sol (OCS GE). Seules les zones imperméables sont affichées.",
				controls: [
					{
						id: "impermeabilisation-diff-visibility",
						type: "visibility",
						targetLayers: ["impermeabilisation-diff-layer", "impermeabilisation-diff-centroid-cluster", "impermeabilisation-diff-centroid-cluster-count"],
						defaultValue: true
					},
					{
						id: "impermeabilisation-diff-opacity",
						type: "opacity",
						targetLayers: ["impermeabilisation-diff-layer", "impermeabilisation-diff-centroid-cluster"],
						defaultValue: 0.7
					}
				]
			}
		],
		popups: [
			{
				layerId: "impermeabilisation-diff-layer",
				trigger: "hover",
				title: "Différence d'imperméabilisation",
				renderContent: (feature) => <ImpermeabilisationDiffPopup feature={feature} />,
			}
		]
    });

	return (
		<BaseMap
			id="impermeabilisation-diff-map"
			config={config}
			landData={landData}
			bounds={landData.bounds}
			maxBounds={landData.max_bounds}
		/>
	);
};

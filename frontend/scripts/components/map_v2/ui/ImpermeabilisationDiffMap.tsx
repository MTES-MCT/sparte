import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import type { ControlGroup } from "../types/controls";
import { ImpermeabilisationDiffPopup } from "./popup/ImpermeabilisationDiffPopup";

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
}

export const ImpermeabilisationDiffMap: React.FC<ImpermeabilisationMapProps> = ({
  	landData,
}) => {
	// Calculer les paramètres OCSGE
	const lastMillesimeIndex = landData.millesimes ? Math.max(...landData.millesimes.map(m => m.index)) : 1;
	const startMillesimeIndex = lastMillesimeIndex > 1 ? lastMillesimeIndex - 1 : lastMillesimeIndex;
	const firstDepartement = landData.departements ? landData.departements[0] : "";
    const availableMillesimes = (landData.millesimes || []).map(m => ({ index: m.index, year: m.year }));

    const controlGroups: ControlGroup[] = [
        {
            id: "orthophoto-group",
            label: "Fond de carte",
            description: "Image aérienne du territoire",
            controls: [
                {
                    id: "orthophoto-visibility",
                    type: "visibility",
                    targetLayers: ["orthophoto-layer"],
                    defaultValue: true
                },
                {
                    id: "orthophoto-opacity",
                    type: "opacity",
                    targetLayers: ["orthophoto-layer"],
                    defaultValue: 1
                }
            ]
        },
        {
            id: "emprise-group",
            label: "Emprise du territoire",
            description: "Contour géographique du territoire",
            controls: [
                {
                    id: "emprise-visibility",
                    type: "visibility",
                    targetLayers: ["emprise-layer"],
                    defaultValue: true
                },
                {
                    id: "emprise-opacity",
                    type: "opacity",
                    targetLayers: ["emprise-layer"],
                    defaultValue: 1
                }
            ]
        },
        {
            id: "impermeabilisation-diff-group",
            label: "Différence d'imperméabilisation",
            description: "Surfaces imperméabilisées basée sur l'occupation du sol (OCS GE). Seules les zones imperméables sont affichées.",
            controls: [
                {
                    id: "impermeabilisation-diff-visibility",
                    type: "visibility",
                    targetLayers: ["impermeabilisation-diff-layer"],
                    defaultValue: true
                },
                {
                    id: "impermeabilisation-diff-opacity",
                    type: "opacity",
                    targetLayers: ["impermeabilisation-diff-layer"],
                    defaultValue: 0.7
                }
            ]
        }
    ];

    const config = defineMapConfig({
		sources: [
			{ id: "orthophoto-source", type: "orthophoto" },
			{ id: "emprise-source", type: "emprise", land_type:landData.land_type, land_id: landData.land_id },
			{ id: "ocsge-diff-source", type: "ocsge-diff", millesimes: landData.millesimes, departements: landData.departements, startMillesimeIndex: startMillesimeIndex, endMillesimeIndex: lastMillesimeIndex },
		],
		layers: [
            { id: "orthophoto-layer", type: "orthophoto", source: "orthophoto-source" },
            { id: "emprise-layer", type: "emprise", source: "emprise-source" },
            { id: "impermeabilisation-diff-layer", type: "impermeabilisation-diff", source: "ocsge-diff-source", startMillesimeIndex: startMillesimeIndex, endMillesimeIndex: lastMillesimeIndex, departement: firstDepartement, stats: true },
		],
		controlGroups,
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
			bounds={landData.bounds}
			maxBounds={landData.max_bounds}
		/>
	);
};

import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import type { ControlGroup } from "../types/controls";

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
}

export const ImpermeabilisationMap: React.FC<ImpermeabilisationMapProps> = ({
  	landData,
}) => {
	// Calculer les paramètres OCSGE
	const lastMillesimeIndex = landData.millesimes ? Math.max(...landData.millesimes.map(m => m.index)) : 1;
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
                    defaultValue: 1,
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
                    defaultValue: 1,
                }
            ]
        },
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
                    defaultValue: 0.7,
                },
                {
                    id: "impermeabilisation-millesime",
                    type: "millesime",
                    targetLayers: ["impermeabilisation-layer"],
                    sourceId: "ocsge-source",
                    defaultValue: lastMillesimeIndex,
                    options: availableMillesimes.map(m => ({
                        value: m.index,
                        label: m.year ? `${m.year}` : `Index ${m.index}`
                    })),
                }
            ]
        }
    ];

    const config = defineMapConfig({
		sources: [
			{ id: "orthophoto-source", type: "orthophoto" },
			{ id: "emprise-source", type: "emprise", land_type:landData.land_type, land_id: landData.land_id },
			{ id: "ocsge-source", type: "ocsge", millesimes: landData.millesimes, departements: landData.departements, millesimeIndex: lastMillesimeIndex },
		],
		layers: [
            { id: "orthophoto-layer", type: "orthophoto", source: "orthophoto-source" },
            { id: "emprise-layer", type: "emprise", source: "emprise-source" },
            { id: "impermeabilisation-layer", type: "impermeabilisation", source: "ocsge-source", millesimeIndex: lastMillesimeIndex, departement: firstDepartement, millesimes: availableMillesimes },
		],
		controlGroups
    });

	return (
		<BaseMap
			id="impermeabilisation-map"
			config={config}
			bounds={landData.bounds}
			maxBounds={landData.max_bounds}
		/>
	);
};

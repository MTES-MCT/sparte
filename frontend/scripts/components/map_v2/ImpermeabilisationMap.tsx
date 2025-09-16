import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "./types/builder";
import { LandDetailResultType } from "@services/types/land";

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

    const config = defineMapConfig({
		sources: [
			{ id: "orthophoto-source", type: "orthophoto" },
			{ id: "emprise-source", type: "emprise", land_type:landData.land_type, land_id: landData.land_id },
			{ id: "ocsge-source", type: "ocsge", millesimes: landData.millesimes, departements: landData.departements },
		],
		layers: [
            { id: "orthophoto-layer", type: "orthophoto", source: "orthophoto-source" },
            { id: "emprise-layer", type: "emprise", source: "emprise-source" },
            { id: "impermeabilisation-layer", type: "impermeabilisation", source: "ocsge-source", millesimeIndex: lastMillesimeIndex, departement: firstDepartement, millesimes: availableMillesimes },
		],
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

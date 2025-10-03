import React, { useRef } from "react";
import { BaseMaplibre } from "./BaseMaplibre";
import { LayerOrchestrator } from "../LayerOrchestrator";
import { MapLibreMapper } from "./mappers";
import { initMapFromConfig } from "../factory/initMapFromConfig";
import { LandDetailResultType } from "@services/types/land";

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
}

export const ImpermeabilisationMap: React.FC<ImpermeabilisationMapProps> = ({
  	landData,
}) => {
	const mapper = useRef(new MapLibreMapper());
	const orchestrator = useRef(new LayerOrchestrator());

	orchestrator.current.setMapper(mapper.current);

	// Calculer les paramètres OCSGE
	const lastMillesimeIndex = landData.millesimes ? Math.max(...landData.millesimes.map(m => m.index)) : 1;
	const firstDepartement = landData.departements ? landData.departements[0] : "";

    const config = {
		sources: [
			{ id: "orthophoto-source", type: "orthophoto" },
			{ id: "emprise-source", type: "emprise", land_type:landData.land_type, land_id: landData.land_id },
			{ id: "ocsge-source", type: "ocsge", millesimes: landData.millesimes, departements: landData.departements },
		],
		layers: [
			{ id: "orthophoto-layer", type: "orthophoto", source: "orthophoto-source" },
			{ id: "emprise-layer", type: "emprise", source: "emprise-source" },
			{ id: "impermeabilisation-layer", type: "impermeabilisation", source: "ocsge-source", millesimeIndex: lastMillesimeIndex, departement: firstDepartement },
		],
        layerControls: { showControls: true },
	};

	const handleMapLoad = async (map: any) => {
		await initMapFromConfig(config, orchestrator.current);
	};

	return (
		<BaseMaplibre
			id="impermeabilisation-map"
			onMapLoad={handleMapLoad}
			mapper={mapper.current}
			orchestrator={orchestrator.current}
			bounds={landData.bounds}
			maxBounds={landData.max_bounds}
			showZoomIndicator
            layerControls={config.layerControls}
		/>
	);
};

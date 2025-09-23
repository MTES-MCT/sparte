import React, { useRef, useEffect } from "react";
import { BaseMaplibre } from "./BaseMaplibre";
import { LayerOrchestrator } from "../LayerOrchestrator";
import { MapLibreMapper } from "./mappers";
import { OrthophotoSource } from "../sources/orthophotoSource";
import { OrthophotoLayer } from "../layers/orthophotoLayer";
import { EmpriseSource } from "../sources/empriseSource";
import { EmpriseLayer } from "../layers/empriseLayer";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandGeomQuery } from "@services/api";
import { LayerControlsConfig } from "../types";

interface ImpermeabilisationMapProps {
    landData: LandDetailResultType;
}

export const ImpermeabilisationMap: React.FC<ImpermeabilisationMapProps> = ({
    landData,
}) => {
    const mapper = useRef(new MapLibreMapper());
    const orchestrator = useRef(new LayerOrchestrator());
    const mapRef = useRef<any>(null);

    orchestrator.current.setMapper(mapper.current);
    const { land_type, land_id, bounds, max_bounds } = landData;
    const { data: geom_data } = useGetLandGeomQuery({ land_type, land_id });
    const { simple_geom } = geom_data || {};

    // Configuration des contrôles de layers
    const layerControls: LayerControlsConfig = {
        showControls: true,
        layers: [
            { id: "orthophoto-layer", name: "Orthophoto", visible: true, opacity: 1 },
            { id: "emprise-layer", name: "Emprise", visible: true, opacity: 0.7 },
        ],
    };
    
    const handleMapLoad = (map: any) => {
        mapRef.current = map;
        const orthophotoSource = new OrthophotoSource();
        const orthophotoLayer = new OrthophotoLayer();

        // Ajouter l'emprise avec des données vides dès le début
        const emptyEmpriseSource = new EmpriseSource({ type: "FeatureCollection", features: [] });
        const empriseLayer = new EmpriseLayer();

        orchestrator.current.addSource(orthophotoSource);
        orchestrator.current.addLayer(orthophotoLayer);
        orchestrator.current.addSource(emptyEmpriseSource);
        orchestrator.current.addLayer(empriseLayer);
    };

    // Mettre à jour l'emprise quand les données sont disponibles
    useEffect(() => {
        if (simple_geom && mapRef.current) {            
            // Mettre à jour la source existante
            const map = mapRef.current;
            const source = map.getSource("emprise-source");
            if (source && source.type === "geojson") {
                (source as any).setData(simple_geom);
            }
        }
    }, [simple_geom]);

    return (
        <div style={{ height: "400px", width: "100%" }}>
            <BaseMaplibre
                id="impermeabilisation-map"
                onMapLoad={handleMapLoad}
                mapper={mapper.current}
                orchestrator={orchestrator.current}
                bounds={bounds}
                maxBounds={max_bounds}
                showZoomIndicator={true}
                layerControls={layerControls}
            />
        </div>
    );
};

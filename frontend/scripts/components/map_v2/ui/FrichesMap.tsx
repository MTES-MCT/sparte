import React, { useMemo } from "react";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { FrichesInfo, OcsgeFrichesInfo } from "./infoPanel";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";

interface FrichesMapProps {
    landData: LandDetailResultType;
    frichesData?: LandFriche[];
    center?: [number, number] | null;
}

export const FrichesMap: React.FC<FrichesMapProps> = ({
    landData,
    frichesData,
    center
}) => {
    const fricheSiteIds = useMemo(() => {
        return frichesData?.map(f => f.site_id) || [];
    }, [frichesData]);

    const extendedLandData = useMemo(() => ({
        ...landData,
        fricheSiteIds
    }), [landData, fricheSiteIds]) as LandDetailResultType & { fricheSiteIds?: string[] };

    const config = useMemo(() => defineMapConfig({
        sources: [
            ...BASE_SOURCES,
            { type: "ocsge-friches" },
            { type: "friches" },
            { type: "friches-centroid" }
        ],
        layers: [
            ...BASE_LAYERS,
            { type: "ocsge-friches" },
            { type: "friches" },
            { type: "friches-centroid-cluster" }
        ],
        controlGroups: [
            ...BASE_CONTROLS,
            {
                id: "friches-group",
                label: "Friches",
                description: "Visualisation des friches du territoire recensées dans le dispositif Cartofriches",
                controls: [
                    {
                        id: "friches-visibility",
                        type: "visibility",
                        targetLayers: ["friches-layer", "friches-centroid-cluster"],
                        defaultValue: true
                    },
                    {
                        id: "friches-opacity",
                        type: "opacity",
                        targetLayers: ["friches-layer"],
                        defaultValue: 0.7
                    }
                ]
            },
            {
                id: "ocsge-friches-group",
                label: "Couverture et usage (OCS GE)",
                description: "Données d'Occupation du sol à grande échelle (OCS GE).",
                controls: [
                    {
                        id: "ocsge-friches-nomenclature",
                        type: "ocsge-nomenclature",
                        targetLayers: ["ocsge-friches-layer"],
                        linkedFilterId: "ocsge-friches-filter",
                        defaultValue: "couverture"
                    },
                    {
                        id: "ocsge-friches-filter",
                        type: "ocsge-nomenclature-filter",
                        targetLayers: ["ocsge-friches-layer"],
                        defaultValue: OCSGE_LAYER_NOMENCLATURES.artificialisation.couverture
                    }
                ]
            }
        ],
        infoPanels: [
            {
                layerId: "friches-layer",
                title: "Friche",
                renderContent: (feature: maplibregl.MapGeoJSONFeature) => <FrichesInfo feature={feature} />,
            },
            {
                layerId: "ocsge-friches-layer",
                title: "OCS GE",
                renderContent: (feature: maplibregl.MapGeoJSONFeature) => <OcsgeFrichesInfo feature={feature} />,
            }
        ]
    }), [extendedLandData]);

    if (!frichesData) {
        return null;
    }

    return (
        <BaseMap
            id="friches-map"
            config={config}
            landData={extendedLandData}
            center={center}
        />
    );
};


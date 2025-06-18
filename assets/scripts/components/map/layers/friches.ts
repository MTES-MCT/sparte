import { SourceSpecification, LayerSpecification } from "maplibre-gl";

export const createFrichesLayer = (landType: string, landId: string) => {
    const source: SourceSpecification = {
        type: "geojson",
        data: `/api/landfrichegeojson/?land_type=${landType}&land_id=${landId}`,
    };

    const layer: LayerSpecification = {
        id: "friches",
        type: "fill",
        source: "friches",
        paint: {
            "fill-color": [
                "match",
                ["get", "friche_statut"],
                "friche reconvertie", "#48D5A7",
                "friche avec projet", "#34BAB5",
                "friche sans projet", "#FA6E6E",
                "#FFFFFF" // couleur par défaut
            ],
            "fill-opacity": 0.5,
        },
    };

    return {
        source: {
            id: "friches",
            source,
        },
        layer: {
            id: "friches",
            layer,
        }
    };
}; 
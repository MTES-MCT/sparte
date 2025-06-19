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
                "friche reconvertie", "#18753C",
                "friche avec projet", "#0063CB",
                "friche sans projet", "#B34000",
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
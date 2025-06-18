import { SourceSpecification, LayerSpecification } from "maplibre-gl";

export const createFrichesCentroidLayer = (landType: string, landId: string) => {
    const source: SourceSpecification = {
        type: "geojson",
        data: `/api/landfrichecentroid/?land_type=${landType}&land_id=${landId}`,
        generateId: true,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 100,
        clusterMinPoints: 2,
    };

    const clusterLayer: LayerSpecification = {
        id: "friches-centroid-clusters",
        type: "circle",
        source: "friches-centroid",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": "#4318FF",
            "circle-radius": 20,
            "circle-opacity": 0.8
        },
    };

    const clusterCountLayer: LayerSpecification = {
        id: "friches-centroid-cluster-count",
        type: "symbol",
        source: "friches-centroid",
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count}",
            "text-font": ["Marianne Regular"],
            "text-size": 14,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
        },
        paint: {
            "text-color": "#FFFFFF",
            "text-halo-color": "#FFFFFF",
            "text-halo-width": 0.2,
        },
    };

    const unclusteredPointLayer: LayerSpecification = {
        id: "friches-centroid-unclustered-point",
        type: "circle",
        source: "friches-centroid",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-radius": 4,
            "circle-color": "#4318FF",
            "circle-opacity": 0.8
        },
    };

    return {
        source: {
            id: "friches-centroid",
            source,
        },
        layers: [
            {
                id: "friches-centroid-clusters",
                layer: clusterLayer,
            },
            {
                id: "friches-centroid-cluster-count",
                layer: clusterCountLayer,
            },
            {
                id: "friches-centroid-unclustered-point",
                layer: unclusteredPointLayer,
            }
        ]
    };
}; 
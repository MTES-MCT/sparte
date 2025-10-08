import maplibregl from "maplibre-gl";

export const createVisibilityMapper = () => ({
    toggleVisibility: (map: maplibregl.Map, layerId: string, visible: boolean) => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        }
    },

    setOpacity: (map: maplibregl.Map, layerId: string, opacity: number) => {
        const layer = map.getLayer(layerId);
        if (!layer) return;

        if (layer.type === "raster") {
            map.setPaintProperty(layerId, "raster-opacity", opacity);
        } else if (layer.type === "line") {
            map.setPaintProperty(layerId, "line-opacity", opacity);
        } else if (layer.type === "fill") {
            map.setPaintProperty(layerId, "fill-opacity", opacity);
        }
    },
});

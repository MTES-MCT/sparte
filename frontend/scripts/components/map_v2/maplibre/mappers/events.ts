import maplibregl from "maplibre-gl";

export const createEventsMapper = () => ({
    addClickHandler: (map: maplibregl.Map, layerId: string, handler: (event: any) => void) => {
        map.on("click", layerId, handler);
    },

    removeClickHandler: (map: maplibregl.Map, layerId: string, handler: (event: any) => void) => {
        map.off("click", layerId, handler);
    },

    addHoverHandler: (map: maplibregl.Map, layerId: string, handler: (event: any) => void) => {
        map.on("mouseenter", layerId, handler);
    },

    removeHoverHandler: (map: maplibregl.Map, layerId: string, handler: (event: any) => void) => {
        map.off("mouseenter", layerId, handler);
    },
});

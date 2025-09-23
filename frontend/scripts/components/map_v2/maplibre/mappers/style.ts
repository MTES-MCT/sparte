import maplibregl from "maplibre-gl";

export const createStyleMapper = () => ({
    updateStyle: (map: maplibregl.Map, layerId: string, style: Record<string, any>) => {
        if (!map.getLayer(layerId)) return;

        Object.entries(style).forEach(([property, value]) => {
            if (property.startsWith("paint.")) {
                const paintProperty = property.replace("paint.", "");
                map.setPaintProperty(layerId, paintProperty, value);
            } else if (property.startsWith("layout.")) {
                const layoutProperty = property.replace("layout.", "");
                map.setLayoutProperty(layerId, layoutProperty, value);
            } else {
                if (property.includes("-opacity") || property.includes("-color") || property.includes("-width")) {
                    map.setPaintProperty(layerId, property, value);
                } else {
                    map.setLayoutProperty(layerId, property, value);
                }
            }
        });
    },

    updatePaintProperty: (map: maplibregl.Map, layerId: string, property: string, value: any) => {
        if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, property, value);
        }
    },

    updateLayoutProperty: (map: maplibregl.Map, layerId: string, property: string, value: any) => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, property, value);
        }
    },
});

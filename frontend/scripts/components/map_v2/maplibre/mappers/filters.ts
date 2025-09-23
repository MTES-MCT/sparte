import maplibregl from "maplibre-gl";

export const createFiltersMapper = () => ({
    updateFilters: (map: maplibregl.Map, layerId: string, filters: any) => {
        if (map.getLayer(layerId)) {
            map.setFilter(layerId, filters);
        }
    },

    addFilter: (map: maplibregl.Map, layerId: string, filter: any) => {
        const currentFilters = map.getFilter(layerId) || [];
        const newFilters = Array.isArray(currentFilters) ? [...currentFilters, filter] : [filter];
        map.setFilter(layerId, newFilters as any);
    },

    removeFilter: (map: maplibregl.Map, layerId: string, filterIndex: number) => {
        const currentFilters = map.getFilter(layerId);
        if (Array.isArray(currentFilters)) {
            const newFilters = currentFilters.filter((_, index) => index !== filterIndex);
            map.setFilter(layerId, newFilters as any);
        }
    },
});

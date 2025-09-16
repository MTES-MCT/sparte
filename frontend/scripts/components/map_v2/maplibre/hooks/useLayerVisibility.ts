import { useCallback, useState, useEffect } from "react";
import { Map } from "maplibre-gl";
import { LayerVisibility } from "../../types";

export const useLayerVisibility = (
  map: Map | null,
  initialLayers: LayerVisibility[]
) => {
  const [layers, setLayers] = useState<LayerVisibility[]>([]);

  // Mettre à jour les layers quand la map change
  useEffect(() => {
    if (map && initialLayers.length > 0) {
      setLayers(initialLayers);
    }
  }, [map, initialLayers]);

  const toggleLayer = useCallback((layerId: string, visible: boolean) => {
    if (!map) return;

    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );

    // Toggle layer visibility
    if (visible) {
      map.setLayoutProperty(layerId, 'visibility', 'visible');
    } else {
      map.setLayoutProperty(layerId, 'visibility', 'none');
    }
  }, [map]);

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    if (!map) return;

    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === layerId ? { ...layer, opacity } : layer
      )
    );

    // Set layer opacity
    const layer = map.getLayer(layerId);
    if (layer) {
      if (layer.type === 'raster') {
        map.setPaintProperty(layerId, 'raster-opacity', opacity);
      } else if (layer.type === 'line') {
        map.setPaintProperty(layerId, 'line-opacity', opacity);
      }
    }
  }, [map]);

  return {
    layers,
    toggleLayer,
    setLayerOpacity,
  };
};

import React from "react";
import type maplibregl from "maplibre-gl";

export interface LayerInfoConfig {
    layerId: string;
    title: string;
    renderContent: (feature: maplibregl.MapGeoJSONFeature) => React.ReactNode;
    onOpen?: (feature: maplibregl.MapGeoJSONFeature) => void;
    onClose?: () => void;
}

export interface LayerInfo {
    layerId: string;
    title: string;
    feature: maplibregl.MapGeoJSONFeature;
}

export interface InfoPanelState {
    layers: LayerInfo[];
}


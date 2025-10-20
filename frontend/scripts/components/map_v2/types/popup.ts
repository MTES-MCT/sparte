import React from "react";
import type maplibregl from "maplibre-gl";

export type PopupTrigger = 'click' | 'hover';

export interface LayerPopupConfig {
    layerId: string;
    trigger: PopupTrigger;
    title: string;
    renderContent: (feature: maplibregl.MapGeoJSONFeature, event?: maplibregl.MapMouseEvent) => React.ReactNode;
    onOpen?: (feature: maplibregl.MapGeoJSONFeature) => void;
    onClose?: () => void;
}

export interface PopupContentProps {
    feature: maplibregl.MapGeoJSONFeature;
    event?: maplibregl.MapMouseEvent;
    onClose?: () => void;
}

export interface PopupState {
    isVisible: boolean;
    feature: maplibregl.MapGeoJSONFeature | null;
    event: maplibregl.MapMouseEvent | null;
    position: { x: number; y: number };
    layerId: string | null;
}

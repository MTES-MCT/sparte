import maplibregl from "maplibre-gl";
import React from "react";
import type { ControlType, ControlUIProps, LayerVisibility, BaseControlInterface } from "../types/controls";

export abstract class BaseControl implements BaseControlInterface {
    abstract readonly type: ControlType;

    abstract apply(map: maplibregl.Map, layerId: string, value: any): void;
    abstract getValue(map: maplibregl.Map, layerId: string): any;
    abstract createUI(props: ControlUIProps): React.ReactElement;

    isDisabled(_layerVisibility: LayerVisibility): boolean {
        return false;
    }

    protected getOpacityPropertyForLayerType(layerType: string): string | null {
        switch (layerType) {
            case 'fill':
                return 'fill-opacity';
            case 'line':
                return 'line-opacity';
            case 'raster':
                return 'raster-opacity';
            case 'symbol':
                return 'text-opacity';
            case 'circle':
                return 'circle-opacity';
            default:
                return null;
        }
    }

    protected layerExists(map: maplibregl.Map, layerId: string): boolean {
        return !!map.getLayer(layerId);
    }
}

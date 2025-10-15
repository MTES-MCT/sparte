import maplibregl from "maplibre-gl";
import React from "react";
import type { ControlType, ControlUIProps, LayerVisibility, BaseControlInterface, ControlContext } from "../types/controls";

export abstract class BaseControl implements BaseControlInterface {

    abstract apply(
        targetLayers: string[],
        value: any,
        context: ControlContext
    ): Promise<void>;

    abstract getValue(map: maplibregl.Map, layerId: string): any;
    abstract createUI(props: ControlUIProps): React.ReactElement;

    shouldDisableWhenGroupHidden(): boolean {
        return this.constructor.name !== 'VisibilityControl';
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

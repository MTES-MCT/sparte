import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, OcsgeDiffMillesimeControl as OcsgeDiffMillesimeControlType, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import type { SourceInterface } from "../types/sourceInterface";
import { OcsgeDiffMillesimeControl as OcsgeDiffMillesimeControlComponent } from "../ui/controls/OcsgeDiffMillesimeControl";

export class OcsgeDiffMillesimeControl extends BaseControl {

    async apply(
        _targetLayers: string[],
        value: string,
        context: ControlContext
    ): Promise<void> {
        const control = context.controlConfig as OcsgeDiffMillesimeControlType;
        const source = context.sources.get(control.sourceId) as SourceInterface;

        if (source?.setMillesimes) {
            // Parser la valeur "startIndex_endIndex_departement" pour extraire les trois composantes
            const parts = value.split('_');
            const startIndex = Number.parseInt(parts[0], 10);
            const endIndex = Number.parseInt(parts[1], 10);
            const departement = parts[2] || undefined;

            // Mettre à jour la source principale
            await source.setMillesimes(startIndex, endIndex, departement);

            // Mettre à jour également la source centroid associée si elle existe
            const centroidSourceId = control.sourceId === 'ocsge-diff-source'
                ? 'ocsge-diff-centroid-source'
                : 'ocsge-artif-diff-centroid-source';

            const centroidSource = context.sources.get(centroidSourceId) as SourceInterface;
            if (centroidSource?.setMillesimes) {
                await centroidSource.setMillesimes(startIndex, endIndex, departement);
            }
        }
    }

    getValue(layerId: string, context?: ControlContext): string | undefined {
        const layer = context?.layers.get(layerId) as LayerInterface;
        const startMillesimeIndex = layer?.getStartMillesimeIndex?.();
        const endMillesimeIndex = layer?.getEndMillesimeIndex?.();
        const departement = layer?.getDepartement?.();

        if (startMillesimeIndex !== undefined && endMillesimeIndex !== undefined && departement) {
            return `${startMillesimeIndex}_${endMillesimeIndex}_${departement}`;
        }
        return undefined;
    }

    createUI(props: ControlUIProps): React.ReactElement {
        return React.createElement(OcsgeDiffMillesimeControlComponent, props);
    }
}


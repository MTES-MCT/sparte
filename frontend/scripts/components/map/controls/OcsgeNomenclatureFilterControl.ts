import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import { OcsgeNomenclatureFilterControl as OcsgeNomenclatureFilterControlComponent } from "../ui/controls/OcsgeNomenclatureFilterControl";
import { COUVERTURE_COLORS, USAGE_COLORS, ALL_OCSGE_COUVERTURE_CODES, ALL_OCSGE_USAGE_CODES } from "../constants/ocsge_nomenclatures";
import type { Couverture, Usage, NomenclatureType } from "../types/ocsge";

export class OcsgeNomenclatureFilterControl extends BaseControl {
    async apply(
        targetLayers: string[],
        value: string[],
        context: ControlContext
    ): Promise<void> {
        for (const layerId of targetLayers) {
            const layer = context.layers.get(layerId) as LayerInterface;
            if (layer?.setFilter) {
                await layer.setFilter(value);
            }
        }
    }

    getValue(layerId: string, context?: ControlContext): string[] {
        const layer = context?.layers.get(layerId) as LayerInterface;
        if (layer?.getCurrentFilter) {
            return layer.getCurrentFilter();
        }
        return this.getAllCodesForCurrentNomenclature(layerId, context);
    }

    createUI(props: ControlUIProps): React.ReactElement {
        const { value, onChange, disabled, context } = props;
        const selectedCodes = value as string[];

        const currentNomenclature = this.getCurrentNomenclature(props.layerId, context);
        const availableCodes = this.getAvailableCodesForNomenclature(currentNomenclature, props.layerId, context);

        return React.createElement(OcsgeNomenclatureFilterControlComponent, {
            value: selectedCodes,
            onChange,
            disabled,
            availableCodes,
            currentNomenclature,
            getColorForCode: this.getColorForCode.bind(this)
        });
    }

    private getCurrentNomenclature(layerId: string, context?: ControlContext): NomenclatureType {
        const layer = context?.layers.get(layerId) as LayerInterface;
        return layer?.getCurrentNomenclature?.() ?? 'couverture';
    }

    private getAvailableCodesForNomenclature(nomenclature: NomenclatureType, layerId: string, context?: ControlContext): string[] {
        const layer = context?.layers.get(layerId) as LayerInterface;
        if (layer?.getLayerNomenclature) {
            const layerNomenclature = layer.getLayerNomenclature();
            return nomenclature === 'couverture' ? layerNomenclature.couverture : layerNomenclature.usage;
        }

        return nomenclature === 'couverture' ? ALL_OCSGE_COUVERTURE_CODES : ALL_OCSGE_USAGE_CODES;
    }

    private getAllCodesForCurrentNomenclature(layerId: string, context?: ControlContext): string[] {
        const nomenclature = this.getCurrentNomenclature(layerId, context);
        return this.getAvailableCodesForNomenclature(nomenclature, layerId, context);
    }

    private getColorForCode(code: string, nomenclature: NomenclatureType): string {
        if (nomenclature === 'couverture') {
            return COUVERTURE_COLORS[code as Couverture] || "rgb(200, 200, 200)";
        } else {
            return USAGE_COLORS[code as Usage] || "rgb(200, 200, 200)";
        }
    }
}

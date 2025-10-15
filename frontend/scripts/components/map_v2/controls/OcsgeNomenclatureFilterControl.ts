import React from "react";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext } from "../types/controls";
import { COUVERTURE_COLORS, USAGE_COLORS, ALL_OCSGE_COUVERTURE_CODES, ALL_OCSGE_USAGE_CODES } from "../constants/ocsge_nomenclatures";
import type { Couverture, Usage, NomenclatureType } from "../types/ocsge";
import type { LayerInterface } from "../types/layerInterface";

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

        return React.createElement('div', {
            className: 'fr-form-group',
            children: [
                React.createElement('fieldset', {
                    key: 'filter-fieldset',
                    className: 'fr-fieldset',
                    children: [
                        React.createElement('legend', {
                            key: 'filter-legend',
                            className: 'fr-fieldset__legend fr-text--regular',
                            children: 'Filtrer par codes'
                        }),
                        React.createElement('div', {
                            key: 'filter-content',
                            className: 'fr-fieldset__content',
                            children: availableCodes.map((code: string) => {
                                const isChecked = selectedCodes.includes(code);
                                const color = this.getColorForCode(code, currentNomenclature);

                                return React.createElement(Checkbox, {
                                    key: `filter-${code}`,
                                    options: [{
                                        label: React.createElement('div', {
                                            style: { display: 'flex', alignItems: 'center', gap: '8px' },
                                            children: [
                                                React.createElement('div', {
                                                    key: `color-${code}`,
                                                    style: {
                                                        width: '16px',
                                                        height: '16px',
                                                        backgroundColor: `rgb(${color.join(', ')})`,
                                                        border: '1px solid #ccc',
                                                        borderRadius: '2px'
                                                    }
                                                }),
                                                React.createElement('span', {
                                                    key: `label-${code}`,
                                                    children: code
                                                })
                                            ]
                                        }),
                                        nativeInputProps: {
                                            name: `filter-${code}`,
                                            value: code,
                                            checked: isChecked,
                                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                                const newSelectedCodes = e.target.checked
                                                    ? [...selectedCodes, code]
                                                    : selectedCodes.filter(c => c !== code);
                                                onChange(newSelectedCodes);
                                            }
                                        }
                                    }],
                                    disabled: disabled
                                });
                            })
                        })
                    ]
                })
            ]
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

    private getColorForCode(code: string, nomenclature: NomenclatureType): [number, number, number] {
        if (nomenclature === 'couverture') {
            return COUVERTURE_COLORS[code as Couverture] || [200, 200, 200];
        } else {
            return USAGE_COLORS[code as Usage] || [200, 200, 200];
        }
    }
}

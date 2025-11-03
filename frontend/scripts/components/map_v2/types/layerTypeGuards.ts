import type { BaseLayer } from "../layers/baseLayer";
import type { NomenclatureType, Couverture, Usage } from "./ocsge";

export function hasMillesime(
    layer: unknown
): layer is BaseLayer & {
    getCurrentMillesime(): number;
    getCurrentDepartement(): string;
} {
    return (
        typeof layer === 'object' &&
        layer !== null &&
        'getCurrentMillesime' in layer &&
        typeof (layer as any).getCurrentMillesime === 'function' &&
        'getCurrentDepartement' in layer &&
        typeof (layer as any).getCurrentDepartement === 'function'
    );
}

export function hasNomenclature(
    layer: unknown
): layer is BaseLayer & {
    getCurrentNomenclature(): NomenclatureType;
    setNomenclature(value: NomenclatureType): void;
    getLayerNomenclature(): { couverture: Couverture[]; usage: Usage[] };
} {
    return (
        typeof layer === 'object' &&
        layer !== null &&
        'getCurrentNomenclature' in layer &&
        typeof (layer as any).getCurrentNomenclature === 'function' &&
        'setNomenclature' in layer &&
        typeof (layer as any).setNomenclature === 'function' &&
        'getLayerNomenclature' in layer &&
        typeof (layer as any).getLayerNomenclature === 'function'
    );
}

export function hasFilter(
    layer: unknown
): layer is BaseLayer & {
    getCurrentFilter(): string[];
    setFilter(codes: string[]): void;
} {
    return (
        typeof layer === 'object' &&
        layer !== null &&
        'getCurrentFilter' in layer &&
        typeof (layer as any).getCurrentFilter === 'function' &&
        'setFilter' in layer &&
        typeof (layer as any).setFilter === 'function'
    );
}

export function hasStats(
    layer: unknown
): layer is BaseLayer & {
    extractStats(features: any[]): any[];
} {
    return (
        typeof layer === 'object' &&
        layer !== null &&
        'extractStats' in layer &&
        typeof (layer as any).extractStats === 'function'
    );
}


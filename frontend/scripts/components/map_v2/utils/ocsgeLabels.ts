import { COUVERTURE_LABELS, USAGE_LABELS } from "../constants/ocsge_nomenclatures";
import type { Couverture, Usage } from "../types/ocsge";

export const getCouvertureLabel = (code: string): string => {
    return COUVERTURE_LABELS[code as Couverture] || code;
};

export const getUsageLabel = (code: string): string => {
    return USAGE_LABELS[code as Usage] || code;
};

export const getOcsgeLabel = (code: string, nomenclature: 'couverture' | 'usage'): string => {
    return nomenclature === 'couverture' ? getCouvertureLabel(code) : getUsageLabel(code);
};

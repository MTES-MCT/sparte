import { Millesime, LandDetailResultType } from "@services/types/land";
import { COUVERTURE_LABELS, USAGE_LABELS } from "../constants/ocsge_nomenclatures";
import type { Couverture, Usage } from "../types/ocsge";
import type { FilterSpecification } from 'maplibre-gl';

export const getLastMillesimeIndex = (millesimes: Millesime[] | undefined): number => {
    if (!millesimes || millesimes.length === 0) {
        return 1;
    }
    return Math.max(...millesimes.map(m => m.index));
};

export const getStartMillesimeIndex = (millesimes: Millesime[] | undefined): number => {
    const lastIndex = getLastMillesimeIndex(millesimes);
    return lastIndex > 1 ? lastIndex - 1 : lastIndex;
};

export const getFirstDepartement = (departements: string[] | undefined): string => {
    return departements?.[0] ?? "";
};

export const getAvailableMillesimes = (millesimes: Millesime[] | undefined): Array<{ index: number; year?: number }> => {
    return (millesimes || []).map(m => ({ index: m.index, year: m.year }));
};

export const getCouvertureLabel = (code: string): string => {
    return COUVERTURE_LABELS[code as Couverture] || code;
};

export const getUsageLabel = (code: string): string => {
    return USAGE_LABELS[code as Usage] || code;
};

export const getOcsgeLabel = (code: string, nomenclature: 'couverture' | 'usage'): string => {
    return nomenclature === 'couverture' ? getCouvertureLabel(code) : getUsageLabel(code);
};

export const getTerritoryFilter = (landData?: LandDetailResultType): FilterSpecification | null => {
    if (!landData?.land_type || !landData?.land_id) {
        return null;
    }

    return ["==", ["get", landData.land_type], landData.land_id] as FilterSpecification;
};

export const getAvailableMillesimePairs = (landData: LandDetailResultType): Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number; departement?: string; departementName?: string }> => {
    const pairs: Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number; departement?: string; departementName?: string }> = [];
    const millesimes = landData.millesimes;

    const millesimesByDept = new Map<string, Millesime[]>();
    for (const m of millesimes) {
        if (!millesimesByDept.has(m.departement)) {
            millesimesByDept.set(m.departement, []);
        }
        millesimesByDept.get(m.departement)!.push(m);
    }

    for (const [dept, deptMillesimes] of Array.from(millesimesByDept.entries())) {
        const sortedMillesimes = [...deptMillesimes].sort((a, b) => a.index - b.index);

        for (let i = 0; i < sortedMillesimes.length - 1; i++) {
            const current = sortedMillesimes[i];
            const next = sortedMillesimes[i + 1];

            if (next.index - current.index === 1) {
                pairs.push({
                    startIndex: current.index,
                    endIndex: next.index,
                    startYear: current.year,
                    endYear: next.year,
                    departement: dept,
                    departementName: current.departement_name || dept
                });
            }
        }
    }

    return pairs;
};


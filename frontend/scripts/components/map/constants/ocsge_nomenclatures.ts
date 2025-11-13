import { CouvertureColors, UsageColors, Couverture, Usage } from "../types/ocsge";

export const COUVERTURE_COLORS: CouvertureColors = {
    "CS1.1.1.1": "rgb(255, 55, 122)",
    "CS1.1.1.2": "rgb(255, 145, 145)",
    "CS1.1.2.1": "rgb(255, 255, 153)",
    "CS1.1.2.2": "rgb(166, 77, 0)",
    "CS1.2.1": "rgb(204, 204, 204)",
    "CS1.2.2": "rgb(0, 204, 242)",
    "CS1.2.3": "rgb(166, 230, 204)",
    "CS2.1.1.1": "rgb(128, 255, 0)",
    "CS2.1.1.2": "rgb(0, 166, 0)",
    "CS2.1.1.3": "rgb(128, 190, 0)",
    "CS2.1.2": "rgb(166, 255, 128)",
    "CS2.1.3": "rgb(230, 128, 0)",
    "CS2.2.1": "rgb(204, 242, 77)",
    "CS2.2.2": "rgb(202, 252, 202)",
};

export const USAGE_COLORS: UsageColors = {
    "US1.1": "rgb(255, 255, 168)",
    "US1.2": "rgb(0, 128, 0)",
    "US1.3": "rgb(166, 0, 204)",
    "US1.4": "rgb(0, 0, 153)",
    "US2": "rgb(230, 0, 77)",
    "US235": "rgb(230, 0, 77)",
    "US3": "rgb(255, 140, 0)",
    "US4.1.1": "rgb(204, 0, 0)",
    "US4.1.2": "rgb(90, 90, 90)",
    "US4.1.3": "rgb(230, 204, 230)",
    "US4.1.4": "rgb(0, 102, 255)",
    "US4.1.5": "rgb(102, 0, 51)",
    "US4.2": "rgb(255, 0, 0)",
    "US4.3": "rgb(255, 75, 0)",
    "US5": "rgb(190, 9, 97)",
    "US6.1": "rgb(255, 77, 255)",
    "US6.2": "rgb(64, 64, 64)",
    "US6.3": "rgb(240, 240, 40)",
    "US6.6": "rgb(255, 204, 0)",
};

export const COUVERTURE_LABELS: Record<Couverture, string> = {
    "CS1.1.1.1": "Zones bâties",
    "CS1.1.1.2": "Zones non bâties",
    "CS1.1.2.1": "Zones à matériaux minéraux",
    "CS1.1.2.2": "Zones à autres matériaux composites",
    "CS1.2.1": "Sols nus",
    "CS1.2.2": "Surfaces d'eau",
    "CS1.2.3": "Névés et glaciers",
    "CS2.1.1.1": "Peuplements de feuillus",
    "CS2.1.1.2": "Peuplements de conifères",
    "CS2.1.1.3": "Peuplements mixtes",
    "CS2.1.2": "Formations arbustives et sous-arbrisseaux",
    "CS2.1.3": "Autres formations ligneuses",
    "CS2.2.1": "Formations herbacées",
    "CS2.2.2": "Autres formations non ligneuses",
};

export const USAGE_LABELS: Record<Usage, string> = {
    "US1.1": "Agriculture",
    "US1.2": "Sylviculture",
    "US1.3": "Activités d'extraction",
    "US1.4": "Pêche et Aquaculture",
    "US2": "Production secondaire",
    "US235": "Production secondaire, tertiaire et usage résidentiel",
    "US3": "Production tertiaire",
    "US4.1.1": "Réseaux routiers",
    "US4.1.2": "Réseaux ferrés",
    "US4.1.3": "Réseaux aériens",
    "US4.1.4": "Réseaux de transport fluvial et maritime",
    "US4.1.5": "Autres réseaux de transport",
    "US4.2": "Services logistiques et de stockage",
    "US4.3": "Réseaux d'utilité publique",
    "US5": "Usage résidentiel",
    "US6.1": "Zones en transition",
    "US6.2": "Zones abandonnées",
    "US6.3": "Sans usage",
    "US6.6": "Usage inconnu",
};

export const ALL_OCSGE_COUVERTURE_CODES: Couverture[] = Object.keys(COUVERTURE_COLORS) as Couverture[];
export const ALL_OCSGE_USAGE_CODES: Usage[] = Object.keys(USAGE_COLORS) as Usage[];

export const OCSGE_LAYER_NOMENCLATURES = {
    impermeabilisation: {
        couverture: ["CS1.1.1.1", "CS1.1.1.2"] as Couverture[],
        usage: ALL_OCSGE_USAGE_CODES
    },
    artificialisation: {
        couverture: ALL_OCSGE_COUVERTURE_CODES,
        usage: ALL_OCSGE_USAGE_CODES
    }
} as const;

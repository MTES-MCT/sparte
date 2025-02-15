import { Couverture, Usage } from "./cs_and_us"

export const usageLabels = {
    "US1.1": "Agriculture",
    "US1.2": "Sylviculture",
    "US1.3": "Activités d'extraction",
    "US1.4": "Pêche et Aquaculture",
    "US1.5": "Autres productions primaires",
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
  }
  
  export const couvertureLabels = {
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
  }

  export const getCouvertureOrUsageLabel = (couvertureOrUsage: Couverture | Usage): string => {
    if (Object.keys(couvertureLabels).includes(couvertureOrUsage)) {
      return couvertureLabels[couvertureOrUsage as Couverture];
    } else {
      return usageLabels[couvertureOrUsage as Usage];
    }
  }
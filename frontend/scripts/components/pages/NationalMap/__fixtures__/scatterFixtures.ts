// Nuages de points d'essai : des modèles réduits à ce que leur graphique dessine, et une vue d'assez
// de territoires pour qu'une carte bivariée en ait un
import type { NationalMapBaseMap, NationalMapIndicators } from '@services/api';
import type { ScatterModel, ScatterPoint } from '../domain/frame/types';
import { CONSO_FRANCE_BY_REGION, FRANCE_BY_REGION } from './nationalMapFixtures';

// Douze régions d'essai, copiées de la Bretagne : la France entière par région, où la carte des
// ménages croise des taux étalés de part et d'autre de ses seuils
export const TWELVE_REGIONS = Array.from({ length: 12 }, (_, index) => `R${index}`);

const [BRETAGNE] = FRANCE_BY_REGION.geojson.features.filter((feature) => feature.properties.land_id === '53');

export const FRANCE_BY_TWELVE_REGIONS: NationalMapBaseMap = {
    ...FRANCE_BY_REGION,
    insets: [],
    geojson: {
        type: 'FeatureCollection',
        features: TWELVE_REGIONS.map((land_id) => ({ ...BRETAGNE, properties: { ...BRETAGNE.properties, land_id, name: `Région ${land_id}` } })),
    },
};

export const CONSO_FRANCE_BY_TWELVE_REGIONS: NationalMapIndicators = {
    ...CONSO_FRANCE_BY_REGION,
    lands: Object.fromEntries(
        TWELVE_REGIONS.map((land_id, index) => [
            land_id,
            { ...CONSO_FRANCE_BY_REGION.lands['53'], bivariate_habitat_menages: { class: index % 9, conso_rate: 0.01 + index / 500, indic_rate: 0.3 + index / 10 } },
        ]),
    ),
};

export const SCATTER_PALETTE = ['#99d8c9', '#4ca092', '#00695c', '#be917e', '#9e9578', '#7e9a73', '#e34a33', '#f08b5e', '#fdcc8a'];

// `count` points aux taux étalés régulièrement, de neuf couleurs au plus : le n-ième a pour taux
// n dixièmes en abscisse et n centièmes en ordonnée
export const scatterPoints = (count: number): ScatterPoint[] =>
    Array.from({ length: count }, (_, index) => ({
        land_id: `T${index}`,
        name: `Territoire ${index}`,
        x: index / 10,
        y: index / 100,
        indicRate: index / 10,
        consoRate: index / 100,
        color: SCATTER_PALETTE[index % SCATTER_PALETTE.length],
        legendKey: index % SCATTER_PALETTE.length,
        valueText: `taux du territoire ${index}`,
    }));

export const scatterModel = (points: ScatterPoint[], changes: Partial<ScatterModel> = {}): ScatterModel => ({
    title: 'Un point par département',
    subtitle: "↑ Consommation annuelle pour l'habitat<br/>→ Évolution du nombre de ménages",
    description: 'Nuage de points des départements.',
    method: 'Un point par département affiché.',
    filename: 'nuage-france-depart-bivariate_habitat_menages',
    x: { label: 'Évolution du nombre de ménages', unit: '% par an', min: 0, max: 2, thresholds: [0.5, 1] },
    y: { label: "Consommation annuelle pour l'habitat", unit: '% par an', min: 0, max: 0.2, thresholds: [0.02, 0.03] },
    points,
    ...changes,
});

import { coreExtent, scatterOf } from './scatter';
import type { CrossedLand, CrossedScatter, Crossing, FrameContext, FrameRender, Period, ScatterModel } from './types';

// Nuage de points d'une carte bivariée, construit du croisement que la carte dessine

const PALETTE = ['#99d8c9', '#4ca092', '#00695c', '#be917e', '#9e9578', '#7e9a73', '#e34a33', '#f08b5e', '#fdcc8a'];
const CONSO_THRESHOLDS: [number, number] = [0.02, 0.03];
const INDIC_THRESHOLDS: [number, number] = [0.5, 1];

const land = (index: number, consoRate: number | null, indicRate: number | null, legendKey = 0): CrossedLand => ({
    land_id: `T${index}`,
    name: `Territoire ${index}`,
    consoRate,
    indicRate,
    color: PALETTE[legendKey],
    legendKey,
    valueText: `taux du territoire ${index}`,
});

const crossingOf = (lands: CrossedLand[]): Crossing => ({
    conso: { label: "Consommation annuelle pour l'habitat", thresholds: CONSO_THRESHOLDS },
    indic: { label: 'Évolution du nombre de ménages', thresholds: INDIC_THRESHOLDS },
    lands,
});

// Carte bivariée par territoire ; `lands` à null : la période n'a pas de seuils
const bivariate = (lands: CrossedLand[] | null): FrameRender => ({ renderer: 'territory', mode: 'bivariate', points: [], crossing: lands && crossingOf(lands) });

const context = (scale = 'DEPART', period: Period | null = { startYear: 2011, endYear: 2024 }): FrameContext =>
    ({ base: { zone: 'REGION_53', scale }, indicator: { id: 'bivariate_habitat_menages' }, period }) as FrameContext;

// `count` territoires aux taux étalés régulièrement : le n-ième a pour taux n centièmes et n dixièmes
const spread = (count: number): CrossedLand[] => Array.from({ length: count }, (_, index) => land(index, index / 100, index / 10, index % 9));

const modelOf = (scatter: CrossedScatter | null): ScatterModel => {
    if (scatter?.kind !== 'points') throw new Error('nuage de points attendu');
    return scatter.model;
};

const subtitleLines = (scatter: CrossedScatter | null): string[] => modelOf(scatter).subtitle.split('<br/>');

describe('coreExtent', () => {
    it('garde toutes les valeurs jusqu’à cent, quel que soit leur ordre', () => {
        expect(coreExtent([3, -1, 2])).toEqual([-1, 3]);
        expect(coreExtent(Array.from({ length: 100 }, (_, index) => 99 - index))).toEqual([0, 99]);
    });

    it('laisse au plus un centième des valeurs de chaque côté', () => {
        expect(coreExtent(Array.from({ length: 101 }, (_, index) => index))).toEqual([1, 99]);
        expect(coreExtent(Array.from({ length: 1000 }, (_, index) => index))).toEqual([9, 990]);
    });

    it('ne modifie pas la liste reçue', () => {
        const values = [3, 1, 2];
        coreExtent(values);

        expect(values).toEqual([3, 1, 2]);
    });
});

describe('cartes sans nuage', () => {
    it('ne donne rien pour une carte qui ne croise pas deux taux', () => {
        expect(scatterOf(context(), { renderer: 'territory', mode: 'choropleth', points: [], classes: [] })).toBeNull();
        expect(scatterOf(context(), { renderer: 'territory', mode: 'symbols', points: [], symbols: [], maxValue: 0, color: '#000091' })).toBeNull();
    });

    it('dit que le nuage n’est pas dessiné pour toutes les communes du pays', () => {
        const dense = { renderer: 'communes', mode: 'bivariate' } as FrameRender;

        expect(scatterOf(context('DEPART'), dense)).toEqual({ kind: 'none', reason: "Le nuage de points n'est pas dessiné pour l'ensemble des communes du pays." });
    });

    it('ne donne rien non plus pour un aplat de toutes les communes du pays', () => {
        expect(scatterOf(context('DEPART'), { renderer: 'communes', mode: 'choropleth' } as FrameRender)).toBeNull();
    });

    it('dit que le nuage n’est pas dessiné sous dix territoires', () => {
        const TOO_FEW = { kind: 'none', reason: "Le nuage de points n'est pas dessiné pour moins de dix territoires." };

        expect(scatterOf(context(), bivariate(spread(9)))).toEqual(TOO_FEW);
        expect(scatterOf(context(), bivariate([]))).toEqual(TOO_FEW);
    });

    it('ne compte que les territoires dont les deux taux sont connus', () => {
        const lands = [...spread(9), land(9, 0, null, 1)];

        expect(scatterOf(context(), bivariate(lands))?.kind).toBe('none');
        expect(scatterOf(context(), bivariate([...lands, land(10, 0.01, 0.2)]))?.kind).toBe('points');
    });

    it('dit que la carte n’a pas de classes pour une période sans seuils', () => {
        expect(scatterOf(context(), bivariate(null))).toEqual({ kind: 'none', reason: "Le nuage de points n'est pas dessiné : la carte n'a pas de classes sur cette période." });
    });
});

describe('construction du nuage', () => {
    const LANDS = spread(12);
    const SCATTER = scatterOf(context(), bivariate(LANDS));

    it('place un point par territoire : l’évolution de l’indicateur en abscisse, le rythme de consommation en ordonnée', () => {
        const { points } = modelOf(SCATTER);

        expect(points).toHaveLength(12);
        expect(points[7]).toMatchObject({ land_id: 'T7', name: 'Territoire 7', x: 0.7, y: 0.07, indicRate: 0.7, consoRate: 0.07 });
    });

    it('donne à chaque point la couleur, la case de légende et le texte de son territoire sur la carte', () => {
        expect(modelOf(SCATTER).points.map(({ color, legendKey, valueText }) => [color, legendKey, valueText])).toEqual(
            LANDS.map(({ color, legendKey, valueText }) => [color, legendKey, valueText]),
        );
    });

    it('trace les seuils des classes de la carte sur chaque axe', () => {
        const { x, y } = modelOf(SCATTER);

        expect(x.thresholds).toBe(INDIC_THRESHOLDS);
        expect(y.thresholds).toBe(CONSO_THRESHOLDS);
    });

    it('nomme chaque axe comme la carte nomme ses deux taux, en pourcentage par an', () => {
        const { x, y } = modelOf(SCATTER);

        expect([x.label, x.unit]).toEqual(['Évolution du nombre de ménages', '% par an']);
        expect([y.label, y.unit]).toEqual(["Consommation annuelle pour l'habitat", '% par an']);
    });

    it('dit dans son titre ce qu’est un point, à la maille affichée', () => {
        expect(modelOf(SCATTER).title).toBe('Un point par département');
        expect(modelOf(scatterOf(context('REGION'), bivariate(LANDS))).title).toBe('Un point par région');
        expect(modelOf(scatterOf(context('COMM'), bivariate(LANDS))).title).toBe('Un point par commune');
        expect(modelOf(scatterOf(context('EPCI'), bivariate(LANDS))).title).toBe('Un point par EPCI');
    });

    it('dit en sous-titre ce que montre chaque axe, l’unité, la période et le sens des tirets', () => {
        expect(subtitleLines(SCATTER)).toEqual([
            "↑ Consommation annuelle pour l'habitat",
            '→ Évolution du nombre de ménages',
            'En % par an, de 2011 à 2024. Tirets : seuils des classes de la carte.',
        ]);
    });

    it('suit la période de la carte affichée', () => {
        const single = scatterOf(context('DEPART', { startYear: 2023, endYear: 2023 }), bivariate(LANDS));

        expect(subtitleLines(single)[2]).toBe('En % par an, en 2023. Tirets : seuils des classes de la carte.');
    });

    it('se décrit pour les lecteurs d’écran', () => {
        expect(modelOf(SCATTER).description).toBe(
            "Nuage de 12 points : un point par département. En abscisse, évolution du nombre de ménages ; en ordonnée, consommation annuelle pour l'habitat ; " +
                'les deux en % par an, de 2011 à 2024. Chaque point a la couleur de son territoire sur la carte.',
        );
    });

    it('explique sa construction, seuils compris, dans les unités de la légende', () => {
        const { method } = modelOf(SCATTER);

        expect(method).toContain('Un point par département affiché, placé selon les deux taux que la carte croise');
        expect(method).toContain("0,02 et 0,03 % par an pour consommation annuelle pour l'habitat, 0,5 et 1 % par an pour évolution du nombre de ménages");
        expect(method).toContain('ramenés au bord du graphique');
    });

    it('nomme le fichier de son image d’après la zone, la maille et la carte', () => {
        expect(modelOf(SCATTER).filename).toBe('nuage-region_53-depart-bivariate_habitat_menages');
    });
});

describe('étendue des axes', () => {
    it('couvre tous les points jusqu’à cent, sans en déplacer aucun', () => {
        const scatter = scatterOf(context(), bivariate(spread(100)));
        const { x, y, points } = modelOf(scatter);

        expect([x.min, x.max]).toEqual([0, 9.9]);
        expect([y.min, y.max]).toEqual([0, 0.99]);
        expect(points.every((point) => point.x === point.indicRate && point.y === point.consoRate)).toBe(true);
        expect(subtitleLines(scatter)).toHaveLength(3);
    });

    it('s’élargit aux seuils de la carte quand les territoires affichés ne les atteignent pas', () => {
        // Douze territoires au même niveau des deux taux, loin sous les seuils
        const lands = Array.from({ length: 12 }, (_, index) => land(index, 0.001 + index / 10000, 0.1 + index / 100));
        const { x, y } = modelOf(scatterOf(context(), bivariate(lands)));

        expect([x.min, x.max]).toEqual([0.1, 1]);
        expect([y.min, y.max]).toEqual([0.001, 0.03]);
    });

    it('s’élargit vers le bas quand tous les territoires dépassent les seuils', () => {
        const lands = Array.from({ length: 12 }, (_, index) => land(index, 0.05 + index / 1000, 2 + index / 10, 8));
        const { x, y } = modelOf(scatterOf(context(), bivariate(lands)));

        expect([x.min, x.max]).toEqual([0.5, 3.1]);
        expect(y.min).toBe(0.02);
        expect(y.max).toBeCloseTo(0.061);
    });

    it('s’arrête avant les taux extrêmes au-delà de cent points, et ramène au bord les points qui dépassent', () => {
        const lands = [...spread(199), land(199, 50, -40, 6)];
        const scatter = scatterOf(context(), bivariate(lands));
        const { x, y, points } = modelOf(scatter);

        // Deux cents points : le plus faible et le plus élevé de chaque axe restent hors de son étendue
        expect([x.min, x.max]).toEqual([0, 19.7]);
        expect([y.min, y.max]).toEqual([0.01, 1.98]);
        expect(points[199]).toMatchObject({ x: 0, y: 1.98, indicRate: -40, consoRate: 50 });
        expect(points[0]).toMatchObject({ x: 0, y: 0.01, indicRate: 0, consoRate: 0 });
        expect(points[100]).toMatchObject({ x: 10, y: 1 });
    });

    it('dit en sous-titre combien de points sont ramenés au bord', () => {
        const several = scatterOf(context(), bivariate([...spread(199), land(199, 50, -40, 6)]));
        // Un seul taux dépasse, d'un seul côté : les territoires partagent leur évolution la plus faible
        const one = scatterOf(context(), bivariate([...Array.from({ length: 150 }, (_, index) => land(index, 0.01, 0.5)), land(150, 0.9, 0.5)]));

        expect(subtitleLines(several)[3]).toBe('3 points hors cadre, ramenés au bord.');
        expect(subtitleLines(one)[3]).toBe('1 point hors cadre, ramené au bord.');
    });

    it('dit en sous-titre combien de territoires ne sont pas placés, faute d’un taux', () => {
        const one = scatterOf(context(), bivariate([...spread(12), land(12, 0, null, 1)]));
        const several = scatterOf(context(), bivariate([...spread(12), land(12, 0, null, 1), land(13, null, 0.4, 1)]));

        expect(modelOf(one).points).toHaveLength(12);
        expect(subtitleLines(one)[3]).toBe("1 territoire non placé, faute d'un des deux taux.");
        expect(subtitleLines(several)[3]).toBe("2 territoires non placés, faute d'un des deux taux.");
    });
});

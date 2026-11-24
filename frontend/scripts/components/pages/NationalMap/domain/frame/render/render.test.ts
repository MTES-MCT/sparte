import { artifFrame, consoFrame } from '../../../__fixtures__/frames';
import {
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_REGION_IN_2024,
    FRANCE_BY_REGION,
} from '../../../__fixtures__/nationalMapFixtures';
import type { NationalMapArtifIndicators, NationalMapArtifLand } from '@services/api';
import type { FrameRender, LandPoint, LegendModel, MapFrame } from '../types';
import { destinationPalette } from '../../grid/consoColors';
import type { ValueClass } from '../../../values';
import { bivariateLegendProps } from './bivariate';

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[  ]/g, ' ');

const france = (indicatorId: string, conso = CONSO_FRANCE_BY_REGION): MapFrame => consoFrame('FRANCE', FRANCE_BY_REGION, indicatorId, conso);
const franceArtif = (indicatorId: string): MapFrame => artifFrame('FRANCE', FRANCE_BY_REGION, indicatorId, ARTIF_FRANCE_BY_REGION);

const CHOROPLETH = france('conso_pct_surface');
const DIVERGING = franceArtif('artif_net_annual_pct_surface');
const SYMBOLS = france('conso_ha');
const RINGS = franceArtif('artif_desartif_ha');
const BIVARIATE = france('bivariate_habitat_menages');
const BIVARIATE_WITHOUT_THRESHOLDS = france('bivariate_habitat_menages', CONSO_FRANCE_BY_REGION_IN_2024);
const GRID = france('conso_ha_gridded');

// Rendus et légendes ramenés à leur variante, pour lire leurs champs sans transtypage
type Territory = Extract<FrameRender, { renderer: 'territory' }>;
const territory = ({ render }: MapFrame): Territory => {
    if (render.renderer !== 'territory') throw new Error('rendu par territoire attendu');
    return render;
};
const symbols = ({ render }: MapFrame): Extract<FrameRender, { mode: 'symbols' }> => {
    if (render.mode !== 'symbols') throw new Error('rendu en cercles attendu');
    return render;
};
const rings = ({ render }: MapFrame): Extract<FrameRender, { mode: 'rings' }> => {
    if (render.mode !== 'rings') throw new Error('rendu en anneaux attendu');
    return render;
};
const grid = ({ render }: MapFrame): Extract<FrameRender, { mode: 'grid' }> => {
    if (render.mode !== 'grid') throw new Error('rendu carroyé attendu');
    return render;
};
const legendOf = <K extends LegendModel['kind']>({ legend }: MapFrame, kind: K): Extract<LegendModel, { kind: K }> => {
    if (legend.kind !== kind) throw new Error(`légende ${kind} attendue`);
    return legend as Extract<LegendModel, { kind: K }>;
};

const pointOf = (frame: MapFrame, landId: string): LandPoint => territory(frame).points.find((point) => point.land_id === landId);
const valueTexts = (frame: MapFrame): string[] => territory(frame).points.map((point) => plain(point.valueText));

describe('aplat de couleur', () => {
    it('découpe les valeurs en classes de Jenks et compte les territoires de chaque classe', () => {
        const legend = legendOf(CHOROPLETH, 'classes');

        expect(territory(CHOROPLETH).mode).toBe('choropleth');
        // Chaque borne est la plus petite valeur de la classe qu'elle ouvre
        expect(legend.classes.map((valueClass) => plain(valueClass.name))).toEqual(['Moins de 0,33 %', 'De 0,33 à 0,53 %', 'De 0,53 à 0,83 %', 'De 0,83 à 0,94 %', '0,94 % et plus']);
        expect(legend.counts).toEqual([2, 1, 2, 1, 1]);
        expect(legend).toMatchObject({
            title: "Consommation d'ENAF (en pourcentage de la surface communale)",
            noDataCount: 0,
            landTypeLabel: 'Régions',
            method: 'Classes par seuils naturels (méthode de Jenks), calculées sur les territoires affichés. Une valeur égale à une borne appartient à la classe supérieure',
        });
    });

    it('pose sur chaque territoire la couleur de sa classe, et fait suivre la valeur de la période', () => {
        // La Bretagne est sur une borne : elle est peinte de la classe qu'elle ouvre, où la légende la compte
        expect(pointOf(CHOROPLETH, '53')).toEqual({
            land_id: '53',
            name: 'Bretagne',
            zone: 'REGION_53',
            value: 0.83,
            valueText: '0,83 % de 2011 à 2024',
            color: '#4b4bc8',
            legendKey: 3,
        });
        expect(legendOf(CHOROPLETH, 'classes').classes[3]).toMatchObject({ from: 0.83, color: '#4b4bc8' });
    });

    it('sépare les baisses des hausses pour une évolution, range les valeurs nulles à part et compte à part les territoires sans donnée', () => {
        const legend = legendOf(DIVERGING, 'classes');

        expect(legend.classes.map((valueClass) => plain(valueClass.name))).toEqual([
            'Moins de 0 % par an',
            '0 % par an',
            'De +0,001 à +0,052 % par an',
            'De +0,052 à +0,069 % par an',
            '+0,069 % par an et plus',
        ]);
        expect(legend.classes.map((valueClass) => valueClass.color)).toEqual(['#b5d5e8', '#ffffbf', '#fdc086', '#ef8a62', '#b2182b']);
        expect(legend.counts).toEqual([1, 1, 2, 1, 1]);
        expect(legend.noDataCount).toBe(1);
        expect(legend.method).toContain('de part et d’autre de zéro sur les territoires affichés');
        expect(legend.method).toContain('les valeurs nulles forment une classe à part');
    });

    it('fait suivre une valeur OCS GE des millésimes du territoire, et ne dit rien de plus d’un territoire sans donnée', () => {
        expect(valueTexts(DIVERGING)).toEqual([
            'Donnée non disponible',
            '0,000 % par an entre le millésime n°1 (2020) et le millésime n°2 (2023)',
            '0,069 % par an entre le millésime n°1 (2017 à 2018) et le millésime n°2 (2021)',
            '0,052 % par an entre le millésime n°1 (2017 à 2019) et le millésime n°2 (2020 à 2022)',
            '0,036 % par an entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2021 à 2023)',
            '0,029 % par an entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023)',
            '-0,028 % par an entre le millésime n°1 (2019) et le millésime n°2 (2021)',
        ]);
        expect(valueTexts(franceArtif('artif_pct')).slice(1, 4)).toEqual(['11,6 % au millésime n°2 (2023)', '20,9 % au millésime n°2 (2021)', '12,3 % au millésime n°2 (2020 à 2022)']);
    });

    it.each([
        ['séquentiel', CHOROPLETH],
        ['divergent', DIVERGING],
    ])('range chaque territoire renseigné dans une classe de la légende (%s) : effectifs et sans donnée font le compte', (_palette, frame) => {
        const legend = legendOf(frame, 'classes');
        const { points } = territory(frame);

        points.forEach((point) => expect(point.legendKey === null).toBe(point.value === null));
        points.filter((point) => point.legendKey !== null).forEach((point) => expect(legend.classes[point.legendKey]).toBeDefined());
        expect(legend.counts.reduce((total, count) => total + count, 0) + legend.noDataCount).toBe(points.length);
    });
});

describe('cercles proportionnels', () => {
    it('laisse les territoires sur un fond neutre et porte la valeur par un cercle, les plus grands d’abord', () => {
        const render = symbols(SYMBOLS);

        expect(new Set(render.points.map((point) => point.color))).toEqual(new Set(['#eeeef8']));
        expect(render.symbols.map((symbol) => symbol.name)).toEqual(['Nouvelle-Aquitaine', 'Auvergne-Rhône-Alpes', 'Bretagne', 'Île-de-France', 'Corse', 'Guyane']);
        expect(render).toMatchObject({ maxValue: 47150.91, color: '#000091' });
        expect(plain(pointOf(SYMBOLS, '53').valueText)).toBe('22 824 ha de 2011 à 2024, soit 1 630 ha par an');
    });

    it('donne aux cercles d’une destination sa couleur, et le bleu du site à ceux de toutes les destinations', () => {
        expect(symbols(france('conso_habitat_ha')).color).toBe('#6a6af4');
        expect(symbols(france('conso_activite_ha')).color).toBe('#289e98');
        expect(legendOf(france('conso_activite_ha'), 'symbols').colors).toEqual([{ color: '#289e98', label: null }]);
        expect(symbols(SYMBOLS).color).toBe('#000091');
    });

    it('ne dessine pas de cercle pour une valeur nulle', () => {
        expect(pointOf(SYMBOLS, '06')).toMatchObject({ value: 0, legendKey: 0 });
        expect(symbols(SYMBOLS).symbols.find((symbol) => symbol.land_id === '06')).toBeUndefined();
    });

    it('donne à la légende des cercles de référence aux valeurs rondes, sans rayon : il dépend de la taille de la carte', () => {
        const legend = legendOf(SYMBOLS, 'symbols');

        expect(legend.references.map(({ value, label }) => [value, plain(label)])).toEqual([
            [20000, '20 000 ha'],
            [10000, '10 000 ha'],
            [2000, '2 000 ha'],
        ]);
        expect(legend).toMatchObject({ shape: 'circle', maxValue: 47150.91, landCount: 7, noDataCount: 0, colors: [{ color: '#000091', label: null }], note: null });
    });

    describe('moyenne annuelle au survol', () => {
        // Consommation des quatre départements bretons sur la décennie de référence, en hectares
        const overDecade = (...hectares: number[]): MapFrame => {
            const lands = Object.entries(CONSO_BRETAGNE_BY_DEPARTEMENT.lands).map(([landId, land], index) => [landId, { ...land, conso_ha: hectares[index] }]);
            return consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha', { ...CONSO_BRETAGNE_BY_DEPARTEMENT, start_year: 2011, end_year: 2020, lands: Object.fromEntries(lands) });
        };

        it('suit le cumul et sa période, sans décimale à partir de 10 ha par an et avec une décimale en dessous', () => {
            expect(valueTexts(overDecade(1651.9, 100, 99.4, 61.2))).toEqual([
                '1 652 ha de 2011 à 2020, soit 165 ha par an',
                '100 ha de 2011 à 2020, soit 10 ha par an',
                '99 ha de 2011 à 2020, soit 9,9 ha par an',
                '61 ha de 2011 à 2020, soit 6,1 ha par an',
            ]);
        });

        it('n’est pas donnée quand elle s’écrirait zéro, ni pour un territoire sans valeur', () => {
            const texts = valueTexts(overDecade(0, 0.4, 0.6, null));

            // Sous dix hectares, le cumul garde une décimale : moins d'un hectare ne se lit pas « 0 ha »
            expect(texts.slice(0, 3)).toEqual(['0 ha de 2011 à 2020', '0,4 ha de 2011 à 2020', '0,6 ha de 2011 à 2020, soit 0,1 ha par an']);
            expect(texts[3]).not.toContain('par an');
        });

        it('n’est pas donnée pour une période d’une seule année, où elle répéterait le cumul', () => {
            expect(plain(pointOf(france('conso_ha', CONSO_FRANCE_BY_REGION_IN_2024), '53').valueText)).toBe('1 158 ha en 2024');
        });

        it('accompagne aussi les cercles et les cartes en hectares par destination, mais pas une part de la surface', () => {
            const [largest] = symbols(SYMBOLS).symbols;

            expect(plain(largest.valueText)).toBe('47 151 ha de 2011 à 2024, soit 3 368 ha par an');
            expect(plain(pointOf(france('conso_habitat_ha'), '53').valueText)).toMatch(/ ha de 2011 à 2024, soit [\d ]+ ha par an$/);
            expect(pointOf(CHOROPLETH, '53').valueText).toBe('0,83 % de 2011 à 2024');
        });
    });

    it('donne la même clé de légende à tout territoire renseigné', () => {
        const { points } = symbols(SYMBOLS);

        points.forEach((point) => expect(point.legendKey).toBe(point.value === null ? null : 0));
        expect(points.filter((point) => point.legendKey === null)).toHaveLength(legendOf(SYMBOLS, 'symbols').noDataCount);
    });
});

describe('anneaux proportionnels', () => {
    // France entière par région où les flux d'une région sont remplacés
    const withFlows = (landId: string, flows: Partial<NationalMapArtifLand>): MapFrame => {
        const { lands } = ARTIF_FRANCE_BY_REGION;
        const artif: NationalMapArtifIndicators = { ...ARTIF_FRANCE_BY_REGION, lands: { ...lands, [landId]: { ...lands[landId], ...flows } } };
        return artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', artif);
    };
    const ringOf = (frame: MapFrame, landId: string) => rings(frame).rings.find((ring) => ring.land_id === landId);
    const nameOf = (frame: MapFrame, landId: string): string => pointOf(frame, landId).name;

    it('porte par la taille de l’anneau la somme des deux flux, et les dessine du plus grand au plus petit', () => {
        const render = rings(RINGS);

        expect(render.rings.map(({ land_id, gross }) => [nameOf(RINGS, land_id), Math.round(gross * 100) / 100])).toEqual([
            ['Nouvelle-Aquitaine', 13897.59],
            ['Auvergne-Rhône-Alpes', 8747.69],
            ['Bretagne', 5934.09],
            ['Île-de-France', 4187.44],
            ['Corse', 596.07],
            ['Mayotte', 334.42],
        ]);
        expect(render.maxValue).toBe(render.rings[0].gross);
    });

    it('partage l’anneau d’après la part de la désartificialisation : faible, égale ou majoritaire', () => {
        expect(ringOf(RINGS, '11').decreaseShare).toBeCloseTo(664.81 / 4187.44);
        expect(ringOf(RINGS, '06').decreaseShare).toBe(0.5);
        expect(ringOf(RINGS, '94').decreaseShare).toBeCloseTo(543.59 / 596.07);
        expect(ringOf(withFlows('11', { desartif_gross_ha: 0 }), '11').decreaseShare).toBe(0);
        expect(ringOf(withFlows('11', { artif_gross_ha: 0 }), '11').decreaseShare).toBe(1);
    });

    it('laisse les territoires sur un fond neutre, avec leur valeur nette', () => {
        const render = rings(RINGS);

        expect(new Set(render.points.filter((point) => point.value !== null).map((point) => point.color))).toEqual(new Set(['#eeeef8']));
        expect(pointOf(RINGS, '11').value).toBeCloseTo(2857.82);
        expect(pointOf(RINGS, '94').value).toBeCloseTo(-491.11);
        expect(pointOf(RINGS, '06')).toMatchObject({ value: 0, legendKey: 0 });
    });

    it('dit au survol les deux flux signés, leur différence et les millésimes du territoire', () => {
        expect(plain(pointOf(RINGS, '11').valueText)).toBe('+3 523 ha artificialisés, −665 ha désartificialisés<br/>soit +2 858 ha nets entre le millésime n°1 (2017 à 2018) et le millésime n°2 (2021)');
        expect(plain(pointOf(RINGS, '94').valueText)).toBe('+52 ha artificialisés, −544 ha désartificialisés<br/>soit −491 ha nets entre le millésime n°1 (2019) et le millésime n°2 (2021)');
        expect(plain(pointOf(RINGS, '06').valueText)).toBe('+167 ha artificialisés, −167 ha désartificialisés<br/>soit 0 ha nets entre le millésime n°1 (2020) et le millésime n°2 (2023)');
    });

    it('écrit les trois nombres avec une décimale dès qu’un des deux flux fait moins de 10 ha', () => {
        const small = withFlows('11', { artif_gross_ha: 37.62, desartif_gross_ha: 0.44 });
        const oneWay = withFlows('11', { artif_gross_ha: 5.2, desartif_gross_ha: 0 });

        expect(plain(pointOf(small, '11').valueText)).toBe('+37,6 ha artificialisés, −0,4 ha désartificialisés<br/>soit +37,2 ha nets entre le millésime n°1 (2017 à 2018) et le millésime n°2 (2021)');
        expect(plain(ringOf(small, '11').netLabel)).toBe('+37,2');
        expect(plain(pointOf(oneWay, '11').valueText)).toBe('+5,2 ha artificialisés, 0 ha désartificialisés<br/>soit +5,2 ha nets entre le millésime n°1 (2017 à 2018) et le millésime n°2 (2021)');
        expect(plain(pointOf(withFlows('11', { desartif_gross_ha: 0 }), '11').valueText)).toMatch(/^\+3 523 ha artificialisés, 0 ha désartificialisés<br\/>soit \+3 523 ha nets/);
    });

    it('écrit au centre de l’anneau la valeur nette, signée et sans unité', () => {
        expect(rings(RINGS).rings.map(({ netLabel }) => plain(netLabel))).toEqual(['+9 736', '+6 053', '+4 274', '+2 858', '−491', '0']);
    });

    it('ne dessine pas d’anneau pour un territoire sans flux, qui reste renseigné', () => {
        const still = withFlows('06', { artif_gross_ha: 0, desartif_gross_ha: 0 });

        expect(ringOf(still, '06')).toBeUndefined();
        expect(rings(still).rings).toHaveLength(5);
        expect(pointOf(still, '06')).toMatchObject({
            value: 0,
            color: '#eeeef8',
            valueText: 'Aucune surface artificialisée ni désartificialisée entre le millésime n°1 (2020) et le millésime n°2 (2023)',
            legendKey: 0,
        });
    });

    it('laisse en gris, sans anneau et hors de la légende, le territoire sans OCS GE', () => {
        expect(pointOf(RINGS, '03')).toMatchObject({ value: null, color: '#dcdcdc', valueText: 'Donnée non disponible', legendKey: null });
        expect(ringOf(RINGS, '03')).toBeUndefined();
        expect(legendOf(RINGS, 'symbols').noDataCount).toBe(1);
    });

    it('tient pour sans donnée le territoire dont un seul des deux flux est connu', () => {
        const partial = withFlows('11', { desartif_gross_ha: null });

        expect(pointOf(partial, '11')).toMatchObject({ value: null, color: '#dcdcdc', legendKey: null });
        expect(ringOf(partial, '11')).toBeUndefined();
    });

    it('donne à la légende des anneaux de référence aux valeurs rondes, sans décimale inutile, et nomme les deux couleurs', () => {
        const legend = legendOf(RINGS, 'symbols');

        expect(legend.references.map(({ value, label }) => [value, plain(label)])).toEqual([
            [10000, '10 000 ha'],
            [2000, '2 000 ha'],
            [500, '500 ha'],
        ]);
        expect(legend).toMatchObject({
            shape: 'ring',
            title: 'Artificialisation et désartificialisation entre les deux derniers millésimes (en hectares)',
            maxValue: rings(RINGS).maxValue,
            landCount: 7,
            colors: [
                { color: '#b2182b', label: 'Artificialisation' },
                { color: '#2166ac', label: 'Désartificialisation' },
            ],
            note: 'Sous 12 px, un disque plein de la couleur du flux le plus fort',
        });
        expect(legend.method).toMatch(/^La surface de chaque anneau est proportionnelle au flux brut du territoire/);
        expect(legend.method).toContain('surfaces désartificialisées entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023). ');
    });

    it('garde une décimale aux références inférieures à un hectare', () => {
        const tiny: NationalMapArtifIndicators = {
            scale: 'REGION',
            lands: { '11': { ...ARTIF_FRANCE_BY_REGION.lands['11'], artif_gross_ha: 0.9, desartif_gross_ha: 0.3 } },
        };
        const { references } = legendOf(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', tiny), 'symbols');

        expect(references.map(({ label }) => plain(label))).toEqual(['1 ha', '0,2 ha']);
    });

    it('n’a ni anneau ni référence quand aucun territoire n’a de flux', () => {
        const uncovered = { scale: 'REGION', lands: { '03': ARTIF_FRANCE_BY_REGION.lands['03'] } };
        const frame = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', uncovered);

        expect(rings(frame)).toMatchObject({ rings: [], maxValue: 0 });
        expect(legendOf(frame, 'symbols').references).toEqual([]);
    });

    it('donne la même clé de légende à tout territoire renseigné', () => {
        const { points } = rings(RINGS);

        points.forEach((point) => expect(point.legendKey).toBe(point.value === null ? null : 0));
    });
});

describe('carte bivariée', () => {
    it('donne à chaque territoire la couleur de sa classe croisée et ses deux taux', () => {
        expect(pointOf(BIVARIATE, '53')).toEqual({
            land_id: '53',
            name: 'Bretagne',
            zone: 'REGION_53',
            value: 7,
            color: '#f08b5e',
            valueText: "Consommation annuelle pour l'habitat : 0,041 % par an<br/>Évolution du nombre de ménages : 1,11 % par an",
            legendKey: 7,
        });
        expect(pointOf(BIVARIATE, '06').valueText).toContain('Évolution du nombre de ménages : n.d. par an');
    });

    it('désigne par chaque clé de légende une des neuf cases de la grille', () => {
        const { props } = legendOf(BIVARIATE, 'bivariate');
        const cells = props.colorGrid.flat();

        expect(cells).toHaveLength(9);
        territory(BIVARIATE).points.forEach((point) => expect(cells[point.legendKey]).toBe(point.color));
    });

    it('porte le croisement que la carte dessine : les deux taux de chaque territoire classé, avec sa couleur, sa case et son texte', () => {
        const render = territory(BIVARIATE);
        if (render.mode !== 'bivariate') throw new Error('rendu bivarié attendu');
        const { lands } = render.crossing;
        const classed = render.points.filter((point) => point.legendKey !== null);

        expect(lands.map(({ land_id, name, color, legendKey, valueText }) => ({ land_id, name, color, legendKey, valueText }))).toEqual(
            classed.map(({ land_id, name, color, legendKey, valueText }) => ({ land_id, name, color, legendKey, valueText })),
        );
        expect(lands.find((land) => land.land_id === '53')).toMatchObject({ consoRate: 0.0413, indicRate: 1.1081 });
        // Un taux inconnu reste inconnu : le territoire est classé, mais ne se place pas dans un nuage
        expect(lands.find((land) => land.land_id === '06')).toMatchObject({ consoRate: 0, indicRate: null });
    });

    it('porte les seuils des trois niveaux de chaque taux, et ce que chacun mesure', () => {
        const render = territory(BIVARIATE);
        if (render.mode !== 'bivariate') throw new Error('rendu bivarié attendu');

        expect(render.crossing.conso).toEqual({ label: "Consommation annuelle pour l'habitat", thresholds: [0.0189, 0.0276] });
        expect(render.crossing.indic).toEqual({ label: 'Évolution du nombre de ménages', thresholds: [0.6706, 1.1359] });
    });

    it('n’a pas de croisement quand la période n’a pas de seuils', () => {
        expect(territory(BIVARIATE_WITHOUT_THRESHOLDS)).toMatchObject({ mode: 'bivariate', crossing: null });
    });

    it('laisse les territoires en gris et la légende sans intervalles quand la période n’a pas de seuils', () => {
        const { props } = legendOf(BIVARIATE_WITHOUT_THRESHOLDS, 'bivariate');

        expect(territory(BIVARIATE_WITHOUT_THRESHOLDS).points.map(({ color, valueText, legendKey }) => [color, valueText, legendKey])).toEqual(
            FRANCE_BY_REGION.geojson.features.map(() => ['#dcdcdc', 'Donnée non disponible', null]),
        );
        expect(props).toMatchObject({ consoRanges: null, indicRanges: null, consoLabel: "Consommation annuelle pour l'habitat", indicName: 'Évolution du nombre de ménages' });
    });

    describe('bivariateLegendProps', () => {
        const meta = CONSO_FRANCE_BY_REGION.bivariate.bivariate_habitat_menages;

        it('donne les intervalles des trois niveaux, bornés par les taux des territoires affichés', () => {
            const props = bivariateLegendProps(meta, 'REGION', { min: 0.0009, max: 0.0796 }, { min: 0.6353, max: 2.5195 });

            expect(props.consoRanges).toEqual(['[0,0009, 0,019]', ']0,019, 0,028]', ']0,028, 0,08]']);
            expect(props.indicRanges).toEqual(['[+0,64, +0,67]', ']+0,67, +1,14]', ']+1,14, +2,52]']);
            expect(props.colorGrid).toEqual([meta.palette.slice(0, 3), meta.palette.slice(3, 6), meta.palette.slice(6, 9)]);
            expect(props.childLandTypeLabel).toBe('régions');
        });

        it('laisse les intervalles ouverts quand aucun territoire affiché n’a de taux', () => {
            const props = bivariateLegendProps(meta, 'REGION', { min: null, max: null }, { min: null, max: null });

            expect(props.consoRanges).toEqual(['[0, 0,019]', ']0,019, 0,028]', ']0,028, ∞]']);
            expect(props.indicRanges).toEqual(['[−∞, +0,67]', ']+0,67, +1,14]', ']+1,14, +∞]']);
        });
    });
});

describe('données carroyées', () => {
    // Texte du survol d'un carreau d'après les attributs de sa tuile (consommation en m²)
    const read = (frame: MapFrame, properties: Record<string, unknown>): string => plain(grid(frame).cells.read(properties).valueText);

    it('retire du fond national les régions d’outre-mer, que le carroyage ne couvre pas', () => {
        expect(grid(GRID).features.map((feature) => feature.properties.land_id)).toEqual(['11', '53', '75', '84', '94']);
        expect(grid(GRID)).toMatchObject({ renderer: 'grid', insets: [], separation: [], detail: null });
        expect(grid(GRID).cells).toMatchObject({ key: 'carroyage_national.pmtiles|FRANCE|', file: 'carroyage_national.pmtiles', layer: 'carroyage_national' });
    });

    it('garde tous les territoires d’une région, et lit les tuiles de sa zone', () => {
        const render = grid(consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha_gridded', CONSO_BRETAGNE_BY_DEPARTEMENT));

        expect(render.features).toBe(BRETAGNE_BY_DEPARTEMENT.geojson.features);
        expect(render.cells).toMatchObject({ key: 'carroyage_lea.pmtiles|REGION_53|', file: 'carroyage_lea.pmtiles', layer: 'carroyage_lea' });
    });

    it('décrit des carreaux aux bornes fixes, en m², lissés, sur le fond clair des territoires', () => {
        expect(grid(GRID).cells).toMatchObject({ bounds: [1000, 5000, 10000, 50000], antialias: true, landColor: '#f0f0f0' });
        expect(grid(GRID).cells.classes).toBe(legendOf(GRID, 'grid').classes);
        expect(JSON.stringify(grid(GRID).cells.value)).toContain('conso_2011');
        expect(JSON.stringify(grid(GRID).cells.value)).toContain('conso_2024');
        expect(JSON.stringify(grid(france('conso_ha_gridded', CONSO_FRANCE_BY_REGION_IN_2024)).cells.value)).not.toContain('conso_2011');
    });

    it('décrit la valeur d’un carreau de 1 km, avec ou sans consommation, sur la période affichée', () => {
        expect(read(GRID, { conso_2011: 12500 })).toBe('1,25 ha consommés dans ce carreau de 2011 à 2024');
        expect(grid(GRID).cells.read({ conso_2011: 12500 })).toMatchObject({ name: 'Carreau de 1 km × 1 km', classIndex: 3 });
        expect(grid(GRID).cells.texts.empty).toBe('Pas de consommation localisée dans ce carreau de 2011 à 2024');
    });

    it('décrit la valeur d’un bloc de carreaux regroupés comme une moyenne par km²', () => {
        expect(read(GRID, { resolution_km: 5, conso_2012: 3500 })).toBe('0,35 ha consommés par km², en moyenne sur ce bloc de 5 km × 5 km de 2011 à 2024');
        expect(read(GRID, { resolution_km: 2, conso_2012: 3500 })).toBe('0,35 ha consommés par km², en moyenne sur ce bloc de 2 km × 2 km de 2011 à 2024');
        expect(grid(GRID).cells.read({ resolution_km: 5, conso_2012: 3500 }).name).toBe('Bloc de 5 km × 5 km');
    });

    it('donne ses messages à la carte : chargement, fichier absent, zone hors de l’emprise', () => {
        expect(grid(GRID).cells.texts).toMatchObject({ loading: 'Chargement des carreaux…', outside: null });
        expect(grid(GRID).cells.texts.missing).toMatch(/^Les données carroyées ne sont pas encore disponibles pour la France entière/);
        expect(grid(consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha_gridded', CONSO_BRETAGNE_BY_DEPARTEMENT)).cells.texts.missing).toBe(
            "Les données carroyées n'ont pas pu être chargées.",
        );
    });

    it('donne à la légende les classes fixes et la période', () => {
        const legend = legendOf(GRID, 'grid');

        expect(legend.classes.map((valueClass) => plain(valueClass.name))).toEqual(["Jusqu'à 0,1 ha", 'De 0,1 à 0,5 ha', 'De 0,5 à 1 ha', 'De 1 à 5 ha', 'Plus de 5 ha']);
        expect(legend).toMatchObject({ title: "Consommation d'ENAF (en hectares), données carroyées", basis: 'Par km², de 2011 à 2024', noData: null, detail: null });
        expect(legend.method).toMatch(/^Classes à bornes fixes/);
        expect(legend.method).not.toMatch(/Seule la consommation/);
    });

    describe('d’une destination', () => {
        const ROUTES = france('conso_route_ha_gridded');
        const UNKNOWN = france('conso_inconnu_ha_gridded');
        const BRETAGNE_HABITAT = consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_habitat_ha_gridded', CONSO_BRETAGNE_BY_DEPARTEMENT);

        it('dessine les carreaux de la destination de la carte, et tous pour la carte de toutes les destinations', () => {
            expect(grid(GRID).cells.file).toBe('carroyage_national.pmtiles');
            expect(grid(ROUTES).cells).toMatchObject({ key: 'carroyage_national_route.pmtiles|FRANCE|route', file: 'carroyage_national_route.pmtiles' });
            // Le fichier des diagnostics porte toutes les destinations : celle de la carte se lit dans ses attributs
            expect(grid(BRETAGNE_HABITAT).cells).toMatchObject({ key: 'carroyage_lea.pmtiles|REGION_53|habitat', file: 'carroyage_lea.pmtiles' });
            expect(JSON.stringify(grid(BRETAGNE_HABITAT).cells.value)).toContain('conso_2011_habitat');
        });

        it('donne à la carte les mêmes territoires d’une destination ou d’une période à l’autre : elle n’a pas à recadrer son fond', () => {
            expect(grid(ROUTES).features).toBe(grid(GRID).features);
            expect(grid(france('conso_route_ha_gridded', CONSO_FRANCE_BY_REGION_IN_2024)).features).toBe(grid(GRID).features);
            expect(grid(consoFrame('HEXAGONE', FRANCE_BY_REGION, 'conso_ha_gridded', CONSO_FRANCE_BY_REGION)).features).not.toBe(grid(GRID).features);
        });

        it('dit la destination dans la valeur d’un carreau, d’un bloc et d’un endroit sans consommation', () => {
            expect(read(ROUTES, { conso_2011: 12500 })).toBe('1,25 ha consommés à destination des routes dans ce carreau de 2011 à 2024');
            expect(read(ROUTES, { resolution_km: 5, conso_2011: 3500 })).toBe(
                '0,35 ha consommés à destination des routes par km², en moyenne sur ce bloc de 5 km × 5 km de 2011 à 2024',
            );
            expect(grid(ROUTES).cells.texts.empty).toBe('Pas de consommation à destination des routes localisée dans ce carreau de 2011 à 2024');
            expect(read(UNKNOWN, { conso_2011: 200 })).toBe('0,02 ha consommés sans destination connue dans ce carreau de 2011 à 2024');
            expect(read(BRETAGNE_HABITAT, { conso_2011: 99999, conso_2011_habitat: 12500 })).toBe("1,25 ha consommés à destination de l'habitat dans ce carreau de 2011 à 2024");
        });

        it('donne à la légende le titre de la destination, les bornes de toutes les destinations dans sa couleur, et le dit dans la méthode', () => {
            const legend = legendOf(ROUTES, 'grid');
            const bounds = (classes: ValueClass[]) => classes.map(({ name, from, to }) => ({ name, from, to }));

            expect(legend.title).toBe("Consommation d'ENAF à destination des routes (en hectares), données carroyées");
            expect(bounds(legend.classes)).toEqual(bounds(legendOf(GRID, 'grid').classes));
            expect(legend.classes.map(({ color }) => color)).toEqual(destinationPalette('route'));
            expect(legend.basis).toBe('Par km², de 2011 à 2024');
            expect(legend.method).toBe(
                `${legendOf(GRID, 'grid').method}. Seule la consommation à destination des routes est représentée, dans la couleur de cette destination, avec les bornes de la carte de toutes les destinations, pour que les cartes se comparent`,
            );
        });

        it('dessine les carreaux avec les classes de la légende', () => {
            expect(grid(ROUTES).cells.classes).toBe(legendOf(ROUTES, 'grid').classes);
            expect(grid(GRID).cells.classes).toBe(legendOf(GRID, 'grid').classes);
        });
    });
});

describe('sols artificialisés par maille', () => {
    const SOILS = franceArtif('artif_soils');
    const BRETAGNE: NationalMapArtifIndicators = { scale: 'DEPART', lands: {} };
    const BRETAGNE_SOILS = artifFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'artif_soils', BRETAGNE);

    it('garde, sur la France entière, les territoires d’outre-mer rapprochés de l’Hexagone, leurs noms et la ligne qui les sépare', () => {
        expect(grid(SOILS).features).toBe(SOILS.base.features);
        expect(grid(SOILS).features.map((feature) => feature.properties.land_id)).toContain('03');
        expect(grid(SOILS).insets).toBe(SOILS.base.insets);
        expect(grid(SOILS).insets.length).toBeGreaterThan(0);
        expect(grid(SOILS).separation).toBe(SOILS.base.separation);
    });

    it('lit le fichier national des mailles pour toutes les zones, sans lissage, sur le gris des territoires sans donnée', () => {
        expect(grid(SOILS).cells).toMatchObject({
            key: 'sols_artificialises_national.pmtiles|FRANCE',
            file: 'sols_artificialises_national.pmtiles',
            layer: 'sols_artificialises_national',
            bounds: [10, 20, 35, 50],
            antialias: false,
            landColor: '#dcdcdc',
        });
        expect(grid(BRETAGNE_SOILS).cells).toMatchObject({ key: 'sols_artificialises_national.pmtiles|REGION_53', file: 'sols_artificialises_national.pmtiles' });
        expect(grid(SOILS).cells.texts).toMatchObject({ loading: 'Chargement des mailles…', outside: null, empty: 'Pas de donnée OCS GE à cet endroit' });
        expect(grid(BRETAGNE_SOILS).cells.texts.missing).toMatch(/n’est pas encore disponible : la carte « Part du territoire artificialisée » montre la même grandeur par territoire\.$/);
        // Sur une zone nationale, les objets ne se lisent pas de partout sans les mailles
        expect(grid(SOILS).cells.texts.missing).toMatch(/par territoire\. Pour voir les objets OCS GE en zoomant, ouvrez une région, un département ou un EPCI\.$/);
    });

    it('décrit les objets OCS GE qui remplacent les mailles aux grands zooms, lus dans la fiche de la zone', () => {
        expect(grid(SOILS).detail).toMatchObject({ minZoom: 13, maxZoom: 17, land: { land_type: 'NATION', land_id: 'NATION' }, filter: null });
        expect(grid(BRETAGNE_SOILS).detail).toMatchObject({ land: { land_type: 'REGION', land_id: '53' }, filter: ['==', ['get', 'REGION'], '53'] });
    });

    it('donne à la légende les cinq classes de la part artificialisée et la ligne des endroits sans donnée', () => {
        const legend = legendOf(SOILS, 'grid');

        expect(legend.title).toBe('Part des sols artificialisés');
        expect(legend.classes.map(({ name }) => name)).toEqual(['Moins de 10 %', 'De 10 à 20 %', 'De 20 à 35 %', 'De 35 à 50 %', '50 % et plus']);
        expect(legend.classes.map(({ color }) => color)).toEqual(['#BFE6B0', '#DCD487', '#EDB062', '#E67A42', '#CF2A1B']);
        expect(legend.basis).toBe('Par maille. Zoomez pour voir les objets OCS GE.');
        expect(legend.noData).toEqual({ label: 'Pas de donnée OCS GE', color: '#dcdcdc' });
        expect(legend.method).toMatch(/^Part de la surface de chaque maille occupée par des sols artificialisés.*Mailles de 5 km à 250 m de côté selon le zoom/);
    });

    it('donne à la légende ce qu’elle dit des objets quand la carte les dessine', () => {
        const { detail } = legendOf(SOILS, 'grid');

        expect(detail.title).toBe('Nature des sols');
        expect(detail.classes).toEqual([
            { color: '#fa4b42', name: 'Sol artificialisé' },
            { color: '#dcebd2', name: 'Sol non artificialisé' },
        ]);
        expect(detail.classes).toBe(grid(SOILS).detail.classes);
        // Les objets gardent la légende de l'image qu'ils remplacent : seul change ce qu'on peut en faire
        expect(detail.classes).toEqual(legendOf(SOILS, 'grid').image.classes);
        expect(detail.basis).toBe("Objets de l'OCS GE, interactifs : survolez ou touchez un objet pour lire sa nature.");
        expect(detail.hint).toBe('Objets interactifs');
        expect(detail.method).toMatch(/dernier millésime de leur département/);
    });
});

describe('signature de la légende', () => {
    const in2024 = (indicatorId: string): MapFrame => france(indicatorId, CONSO_FRANCE_BY_REGION_IN_2024);

    it('change avec les bornes des classes calculées sur les valeurs', () => {
        expect(in2024('conso_pct_surface').legend.signature).not.toBe(CHOROPLETH.legend.signature);
        expect(france('conso_pct_surface').legend.signature).toBe(CHOROPLETH.legend.signature);
    });

    it('ne change pas avec la période pour des classes fixes, des cercles ou une grille croisée', () => {
        expect(in2024('conso_ha_gridded').legend.signature).toBe(GRID.legend.signature);
        expect(in2024('conso_ha').legend.signature).toBe(SYMBOLS.legend.signature);
        expect(in2024('bivariate_habitat_menages').legend.signature).toBe(BIVARIATE.legend.signature);
    });

    it('ne change pas d’une destination du carroyage à l’autre : leurs classes sont les mêmes', () => {
        expect(france('conso_habitat_ha_gridded').legend.signature).toBe(GRID.legend.signature);
        expect(in2024('conso_ferroviaire_ha_gridded').legend.signature).toBe(GRID.legend.signature);
    });

    it('change avec la zone, la maille et l’indicateur', () => {
        const signatures = [
            GRID.legend.signature,
            consoFrame('HEXAGONE', FRANCE_BY_REGION, 'conso_ha_gridded', CONSO_FRANCE_BY_REGION).legend.signature,
            consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha_gridded', CONSO_BRETAGNE_BY_DEPARTEMENT).legend.signature,
            SYMBOLS.legend.signature,
            france('conso_habitat_ha').legend.signature,
        ];

        expect(new Set(signatures).size).toBe(signatures.length);
    });
});

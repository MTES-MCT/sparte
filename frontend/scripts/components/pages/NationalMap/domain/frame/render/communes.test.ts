import type { NationalMapValues } from '@services/api';
import {
    COMMUNES_ARTIF_SHARE,
    COMMUNES_ARTIF_NET_SHARE,
    COMMUNES_CONSO_EVOLUTION,
    COMMUNES_CONSO_HA,
    COMMUNES_CONSO_SHARE,
    COMMUNES_HABITAT_MENAGES,
    communesColumn,
    realisticShares,
} from '../../../__fixtures__/communesFixtures';
import { communesFrame } from '../../../__fixtures__/frames';
import { ARTIF_FRANCE_BY_DEPARTEMENT, CONSO_FRANCE_BY_DEPARTEMENT, FRANCE_BY_DEPARTEMENT } from '../../../__fixtures__/nationalMapFixtures';
import { communeColors } from '../../communes/colors';
import { NEUTRAL_COLOR } from '../../classification';
import { destinationPalette } from '../../grid/consoColors';
import type { FrameRender, LegendModel, MapFrame } from '../types';
import { NO_DATA_KEY, OUTSIDE_ZONE_KEY } from './communes';

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[  ]/g, ' ');

const RESPONSES = { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT, artif: ARTIF_FRANCE_BY_DEPARTEMENT };

const france = (indicatorId: string, column: NationalMapValues): MapFrame => communesFrame('FRANCE', indicatorId, column, RESPONSES);
const hexagone = (indicatorId: string, column: NationalMapValues): MapFrame => communesFrame('HEXAGONE', indicatorId, column, RESPONSES);

type Communes = Extract<FrameRender, { renderer: 'communes' }>;
const communes = ({ render }: MapFrame): Communes => {
    if (render.renderer !== 'communes') throw new Error('rendu des communes attendu');
    return render;
};
const legendOf = <K extends LegendModel['kind']>({ legend }: MapFrame, kind: K): Extract<LegendModel, { kind: K }> => {
    if (legend.kind !== kind) throw new Error(`légende ${kind} attendue`);
    return legend as Extract<LegendModel, { kind: K }>;
};

// Clé de légende de chaque commune, par identifiant
const keysOf = (frame: MapFrame): Record<string, number> => {
    const { ids, legendKeys } = communes(frame);
    return Object.fromEntries(ids.map((id, rank) => [id, legendKeys[rank]]));
};
const valueText = (frame: MapFrame, landId: string): string => plain(communes(frame).describe(landId).valueText);

describe('aplat des communes d’une zone nationale', () => {
    const SHARE = france('conso_pct_surface', COMMUNES_CONSO_SHARE);

    it('dessine les communes par leur identifiant, sur les départements de la zone', () => {
        const render = communes(SHARE);

        expect(render.mode).toBe('choropleth');
        expect(render.ids).toBe(COMMUNES_CONSO_SHARE.ids);
        expect(render.departments).toBe(SHARE.base.features);
        expect(render.departments.map((feature) => feature.properties.name)).toEqual(["Côtes-d'Armor", 'Ille-et-Vilaine', 'Paris', 'Vaucluse']);
    });

    it('découpe les valeurs des communes affichées en classes par seuils naturels et compte chaque classe', () => {
        const legend = legendOf(SHARE, 'classes');

        // Neuf communes renseignées : 0 ; 0,02 ; 0,2 | 1,19 ; 1,54 | 2,45 | 2,86 ; 2,95 | 3,94
        expect(legend.classes.map((valueClass) => plain(valueClass.name))).toEqual([
            'Moins de 1,19 %',
            'De 1,19 à 2,45 %',
            'De 2,45 à 2,86 %',
            'De 2,86 à 3,94 %',
            '3,94 % et plus',
        ]);
        expect(legend.counts).toEqual([3, 2, 1, 2, 1]);
        expect(legend).toMatchObject({
            title: "Consommation d'ENAF (en pourcentage de la surface communale)",
            noDataCount: 4,
            landTypeLabel: 'Communes',
        });
        expect(legend.method).toBe(
            'Classes par seuils naturels (méthode de Jenks), calculées sur les communes affichées. Une valeur égale à une borne appartient à la classe supérieure',
        );
    });

    it('donne à chaque commune la clé de sa classe, la même règle de borne valant pour la couleur et pour l’effectif', () => {
        const legend = legendOf(SHARE, 'classes');
        const keys = keysOf(SHARE);

        // Ajaccio (1,19), Rennes (2,45), Avignon (2,86) et Cayenne (3,94) sont sur une borne : classe supérieure
        expect(keys).toMatchObject({ '75056': 0, '97304': 0, '69123': 0, '2A004': 1, '22278': 1, '35238': 2, '84007': 3, '31555': 3, '97302': 4 });
        const counted = legend.classes.map((_, index) => Object.values(keys).filter((key) => key === index).length);
        expect(counted).toEqual(legend.counts);
        expect(communes(SHARE).palette).toEqual(legend.classes.map((valueClass) => valueClass.color));
    });

    it('marque sans donnée les communes sans valeur, comptées à part', () => {
        expect(keysOf(SHARE)).toMatchObject({ '09304': NO_DATA_KEY, '29083': NO_DATA_KEY, '97608': NO_DATA_KEY, '97611': NO_DATA_KEY });
        expect(communes(SHARE).describe('09304')).toEqual({ valueText: 'Donnée non disponible', legendKey: null });
    });

    it('dit la valeur d’une commune et la période choisie', () => {
        expect(communes(SHARE).describe('35238')).toEqual({ valueText: expect.any(String), legendKey: 2 });
        expect(valueText(SHARE, '35238')).toBe('2,45 % de 2011 à 2024');
    });

    it('ignore une commune que la colonne ne connaît pas', () => {
        expect(communes(SHARE).describe('99999')).toBeNull();
    });

    it('classe la valeur arrondie à la précision d’affichage : une commune à -75,85 % est dans la classe de -75,9 %', () => {
        const column = { ...communesColumn('conso_evolution_between_periods', [-90, -75.85, -75.9, -89, -75, -20]), start_year: null as number | null, end_year: null as number | null };
        const frame = france('conso_evolution_between_periods', column);
        const { classes } = legendOf(frame, 'classes');

        // Trois classes de baisses : -90 et -89 | -75,9 (deux fois) et -75 | -20 ; la deuxième commence à -75,9
        expect(classes.map(({ from, to }) => [from, to])).toEqual([
            [undefined, -75.9],
            [-75.9, -20],
            [-20, undefined],
        ]);
        expect(Array.from(communes(frame).legendKeys)).toEqual([0, 1, 1, 0, 1, 2]);
        expect(valueText(frame, '00001')).toBe('-75,9 %');
    });
});

describe('zone Hexagone', () => {
    const WHOLE = france('conso_pct_surface', COMMUNES_CONSO_SHARE);
    const HEXAGONE = hexagone('conso_pct_surface', COMMUNES_CONSO_SHARE);

    it('marque hors zone les communes de Corse et d’outre-mer, que le survol ignore', () => {
        expect(keysOf(HEXAGONE)).toMatchObject({
            '2A004': OUTSIDE_ZONE_KEY,
            '97302': OUTSIDE_ZONE_KEY,
            '97304': OUTSIDE_ZONE_KEY,
            '97608': OUTSIDE_ZONE_KEY,
            '97611': OUTSIDE_ZONE_KEY,
        });
        expect(communes(HEXAGONE).describe('2A004')).toBeNull();
        expect(communes(HEXAGONE).describe('97611')).toBeNull();
        expect(communes(HEXAGONE).describe('35238')).not.toBeNull();
    });

    it('calcule les classes et les effectifs sans elles', () => {
        const legend = legendOf(HEXAGONE, 'classes');

        // Six communes renseignées dans l'Hexagone : 0 ; 0,2 ; 1,54 ; 2,45 ; 2,86 ; 2,95
        expect(legend.classes.map(({ from, to }) => [from, to])).toEqual([
            [undefined, 0.2],
            [0.2, 1.54],
            [1.54, 2.45],
            [2.45, 2.86],
            [2.86, undefined],
        ]);
        expect(legend.counts).toEqual([1, 1, 1, 1, 2]);
        // Suzan et l'Île-de-Sein ; les communes de Mayotte ne sont pas comptées
        expect(legend.noDataCount).toBe(2);
        expect(legendOf(WHOLE, 'classes').noDataCount).toBe(4);
    });

    it('lit la même colonne que la France entière, sous une autre légende', () => {
        expect(HEXAGONE.communes).toBe(WHOLE.communes);
        expect(HEXAGONE.legend.signature).not.toBe(WHOLE.legend.signature);
        expect(HEXAGONE.key).toBe('HEXAGONE|COMM|conso_pct_surface|2011-2024');
    });
});

describe('carte en hectares sur la vue dense', () => {
    const HECTARES = france('conso_ha', COMMUNES_CONSO_HA);

    it('garde à la carte d’une destination sa couleur : ses classes en sont des nuances, aux mêmes bornes', () => {
        // Ce que l'API rend pour la carte de l'activité : sa part de la surface, et ses hectares
        const activity = france('conso_activite_ha', { ...COMMUNES_CONSO_HA, key: 'conso_activite_pct_surface', amount: 'conso_activite_ha' });
        const colors = legendOf(activity, 'classes').classes.map((valueClass) => valueClass.color);

        expect(colors).toEqual(destinationPalette('activite').slice(0, colors.length));
        expect(colors).not.toEqual(legendOf(HECTARES, 'classes').classes.map((valueClass) => valueClass.color));
        expect(Array.from(communes(activity).legendKeys)).toEqual(Array.from(communes(HECTARES).legendKeys));
    });

    it('dessine la version relative, avec les mêmes classes que la carte en pourcentage', () => {
        const share = france('conso_pct_surface', COMMUNES_CONSO_SHARE);

        expect(communes(HECTARES).mode).toBe('choropleth');
        expect(Array.from(communes(HECTARES).legendKeys)).toEqual(Array.from(communes(share).legendKeys));
        expect(legendOf(HECTARES, 'classes').classes).toEqual(legendOf(share, 'classes').classes);
    });

    it('dit dans le titre de la légende ce qui est dessiné, et dans la méthode où lire les hectares', () => {
        const legend = legendOf(HECTARES, 'classes');

        expect(legend.title).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
        expect(legend.method).toContain('Classes par seuils naturels (méthode de Jenks), calculées sur les communes affichées');
        expect(legend.method).toContain(
            "À l'échelle du pays, des cercles proportionnels par commune ne seraient pas lisibles : la carte représente la valeur rapportée à la surface de chaque commune, et les hectares sont donnés au survol",
        );
    });

    it('donne au survol la valeur dessinée, puis les hectares', () => {
        expect(valueText(HECTARES, '35238')).toBe('2,45 %, soit 123 ha de 2011 à 2024');
        expect(valueText(HECTARES, '75056')).toBe('0,00 %, soit 0 ha de 2011 à 2024');
    });

    it('a sa propre légende, distincte de celle de la carte en pourcentage', () => {
        expect(HECTARES.legend.signature).not.toBe(france('conso_pct_surface', COMMUNES_CONSO_SHARE).legend.signature);
    });
});

describe('évolution sur la vue dense', () => {
    it('range les baisses et les hausses de part et d’autre de zéro', () => {
        const frame = france('conso_evolution_between_periods', COMMUNES_CONSO_EVOLUTION);
        const legend = legendOf(frame, 'classes');

        // Cinq baisses (-100 | -78,1 ; -72,8 ; -54,9 | -30,0) et quatre hausses (2,6 ; 3,8 | 28,6 | 96,0), sans valeur nulle
        expect(legend.classes.map((valueClass) => plain(valueClass.name))).toEqual([
            'Moins de −78,1 %',
            'De −78,1 à −30,0 %',
            'De −30,0 à 0 %',
            'De 0 à +28,6 %',
            'De +28,6 à +96,0 %',
            '+96,0 % et plus',
        ]);
        expect(legend.counts).toEqual([1, 3, 1, 2, 1, 1]);
        expect(legend.method).toContain('de part et d’autre de zéro');
        // Sans période dans la colonne : le texte ne rappelle pas la période choisie
        expect(valueText(frame, '22278')).toBe('-78,1 %');
    });

});

describe('carte en anneaux sur la vue dense', () => {
    // Ce que l'API rend pour la carte en anneaux : l'artificialisation nette en part de la surface, et ses hectares
    const NET_WITH_HECTARES = { ...COMMUNES_ARTIF_NET_SHARE, amount: 'artif_net_ha', amounts: [0.17, 4.63, 0, 14.83, 49.29, 25.09, 8.56, -1.44, 5.53, null, null, 7.57, 19.22] };
    const RINGS = communesFrame('FRANCE', 'artif_desartif_ha', NET_WITH_HECTARES, RESPONSES);

    it('dessine en aplat l’artificialisation nette rapportée à la surface', () => {
        expect(communes(RINGS).mode).toBe('choropleth');
        expect(legendOf(RINGS, 'classes').title).toBe('Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)');
        expect(legendOf(RINGS, 'classes').method).toContain('de part et d’autre de zéro');
    });

    it('réserve une classe aux communes dont l’artificialisation nette est nulle', () => {
        const legend = legendOf(RINGS, 'classes');
        const neutral = legend.classes.findIndex((valueClass) => valueClass.color === NEUTRAL_COLOR);

        expect(plain(legend.classes[neutral].name)).toBe('0 %');
        // L'Île-de-Sein
        expect(keysOf(RINGS)['29083']).toBe(neutral);
        expect(legend.counts[neutral]).toBe(1);
        // Paris, seule baisse
        expect(keysOf(RINGS)['75056']).toBe(0);
    });

    it('donne au survol la part dessinée, les hectares nets et les millésimes de la commune', () => {
        expect(valueText(RINGS, '35238')).toBe('0,50 %, soit 25,1 ha entre le millésime n°1 (2017) et le millésime n°2 (2020)');
        expect(valueText(RINGS, '75056')).toBe('-0,01 %, soit -1,4 ha entre le millésime n°1 (2018) et le millésime n°2 (2021)');
    });

    it('n’écrit pas « -0,0 ha » de très petits hectares négatifs : ils sont arrondis comme la part dessinée', () => {
        const slightlyNegative = {
            ...NET_WITH_HECTARES,
            values: NET_WITH_HECTARES.values.map((value, rank) => (rank === 1 ? -0.0021 : value)),
            amounts: NET_WITH_HECTARES.amounts.map((amount, rank) => (rank === 1 ? -0.03 : amount)),
        };

        expect(valueText(communesFrame('FRANCE', 'artif_desartif_ha', slightlyNegative, RESPONSES), '22278')).toMatch(/^0,00 %, soit 0,0 ha entre /);
    });

    it('dit dans la méthode que des anneaux ne seraient pas lisibles, et où lire les hectares nets', () => {
        expect(legendOf(RINGS, 'classes').method).toContain(
            "À l'échelle du pays, des anneaux par commune ne seraient pas lisibles : la carte représente l'artificialisation nette rapportée à la surface de chaque commune, et ses hectares sont donnés au survol",
        );
    });

    it('ne se construit pas sur une colonne qui n’apporte pas les hectares nets', () => {
        expect(communesFrame('FRANCE', 'artif_desartif_ha', COMMUNES_ARTIF_NET_SHARE, RESPONSES)).toBeNull();
    });
});

describe('carte bivariée sur la vue dense', () => {
    const CROSSED = france('bivariate_habitat_menages', COMMUNES_HABITAT_MENAGES);

    it('lit la classe de chaque commune et la palette dans la réponse', () => {
        const render = communes(CROSSED);

        expect(render.mode).toBe('bivariate');
        expect(render.palette).toBe(COMMUNES_HABITAT_MENAGES.bivariate.palette);
        expect(keysOf(CROSSED)).toMatchObject({ '22278': 6, '2A004': 8, '35238': 7, '69123': 1, '75056': 0, '09304': NO_DATA_KEY });
    });

    it('donne au survol les deux taux de la commune', () => {
        expect(valueText(CROSSED, '35238')).toBe("Consommation annuelle pour l'habitat : 0,078 % par an<br/>Évolution du nombre de ménages : 1,02 % par an");
        expect(communes(CROSSED).describe('35238').legendKey).toBe(7);
    });

    it('décrit la légende par les seuils de la réponse et les bornes des communes affichées', () => {
        const whole = legendOf(CROSSED, 'bivariate').props;
        const inHexagone = legendOf(hexagone('bivariate_habitat_menages', COMMUNES_HABITAT_MENAGES), 'bivariate').props;

        expect(whole).toMatchObject({
            consoRanges: ['[0, 0,0086]', ']0,0086, 0,028]', ']0,028, 0,13]'],
            indicRanges: ['[-0,31, +0,38]', ']+0,38, +1,14]', ']+1,14, +2,32]'],
            childLandTypeLabel: 'communes',
        });
        // Sans Cayenne ni Ajaccio, les taux les plus élevés sont ceux d'Avignon et de Toulouse
        expect(inHexagone).toMatchObject({
            consoRanges: ['[0, 0,0086]', ']0,0086, 0,028]', ']0,028, 0,086]'],
            indicRanges: ['[-0,31, +0,38]', ']+0,38, +1,14]', ']+1,14, +1,68]'],
        });
    });
});

describe('charge de la vue dense', () => {
    const COUNT = 34875;
    const COLUMN = communesColumn('conso_pct_surface', realisticShares(COUNT));

    it('classe et colorie 34 875 communes en moins de 200 ms', () => {
        // Le plus rapide de cinq essais : une machine occupée ne doit pas faire échouer la mesure
        const durations = [1, 2, 3, 4, 5].map(() => {
            const start = performance.now();
            const frame = france('conso_pct_surface', COLUMN);
            const { colors } = communeColors(communes(frame), null);
            const elapsed = performance.now() - start;

            expect(colors).toHaveLength(COUNT);
            expect(legendOf(frame, 'classes').counts.reduce((sum, count) => sum + count, 0)).toBe(COUNT);
            return elapsed;
        });

        expect(Math.min(...durations)).toBeLessThan(200);
    });
});

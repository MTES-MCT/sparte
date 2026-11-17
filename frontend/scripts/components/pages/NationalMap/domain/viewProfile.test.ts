import type { NationalMapValues } from '@services/api';
import { COMMUNES_ARTIF_HA, COMMUNES_CONSO_HA, COMMUNES_HABITAT_MENAGES } from '../__fixtures__/communesFixtures';
import { artifFrame, communesFrame, consoFrame, indicatorOf } from '../__fixtures__/frames';
import {
    ARTIF_FRANCE_BY_DEPARTEMENT,
    ARTIF_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    FRANCE_BY_DEPARTEMENT,
    FRANCE_BY_REGION,
} from '../__fixtures__/nationalMapFixtures';
import { ARTIF_INDICATORS } from '../artifIndicators';
import { Indicator, IndicatorUnit, MAP_INDICATORS } from '../indicators';
import type { MapFrame } from './frame/types';
import { mapNameOf } from './mapName';
import { answersValuesQuery, isDenseView, valuesQueryOf, viewProfileOf } from './viewProfile';
import type { ViewRequest } from './viewState';

const CATALOG: Indicator[] = [...MAP_INDICATORS, ...ARTIF_INDICATORS];

const BY_REGION = { zone: 'FRANCE', scale: 'REGION' };
const BY_COMMUNE = { zone: 'FRANCE', scale: 'COMM' };

describe('isDenseView', () => {
    it('reconnaît les communes d’une zone nationale', () => {
        expect(isDenseView({ zone: 'FRANCE', scale: 'COMM' })).toBe(true);
        expect(isDenseView({ zone: 'HEXAGONE', scale: 'COMM' })).toBe(true);
    });

    it('ne retient ni les autres mailles d’une zone nationale, ni les communes d’un territoire', () => {
        expect(isDenseView({ zone: 'FRANCE', scale: 'EPCI' })).toBe(false);
        expect(isDenseView({ zone: 'REGION_53', scale: 'COMM' })).toBe(false);
        expect(isDenseView({ zone: 'DEPART_35', scale: 'COMM' })).toBe(false);
        expect(isDenseView({ zone: 'EPCI_243500139', scale: 'COMM' })).toBe(false);
    });
});

// --- Profil figé de chaque carte ----------------------------------------------------------

// Méthode de classes : seuils naturels, quantiles, seuils nationaux fournis par l'API (bivariées),
// bornes fixes (carroyage) ; null pour des cercles ou des anneaux, qui n'ont pas de classes
type ClassMethod = 'jenks' | 'quantiles' | 'thresholds' | 'fixed' | null;

type Drawing = {
    renderer: string;
    mode: string;
    // Clé lue dans la réponse, et son unité
    key: string;
    unit: IndicatorUnit | null;
    classes: ClassMethod;
    // Clé des hectares donnés au survol
    amount: string | null;
};

const drawing = (renderer: string, mode: string, key: string, unit: IndicatorUnit | null, classes: ClassMethod, amount: string | null = null): Drawing => ({
    renderer,
    mode,
    key,
    unit,
    classes,
    amount,
});

// Une carte de mailles dessine ses mailles de la même façon sur toutes les vues
const gridded = (id: string, unit: IndicatorUnit = 'ha'): [string, Drawing, Drawing] => [id, drawing('grid', 'grid', id, unit, 'fixed'), drawing('grid', 'grid', id, unit, 'fixed')];

// Pour chaque carte du catalogue, dans l'ordre du menu : ce qu'elle dessine sur une vue par
// territoire, puis sur la vue de toutes les communes du pays. Modifier une ligne, c'est changer
// ce que l'utilisateur voit.
const MAPS: [string, Drawing, Drawing][] = [
    //                                  vue par territoire : moteur, mode, clé lue, unité, classes
    //                                  vue dense : moteur, mode, clé lue, unité, classes, hectares au survol
    [
        'conso_pct_surface',
        drawing('territory', 'choropleth', 'conso_pct_surface', '%', 'jenks'),
        drawing('communes', 'choropleth', 'conso_pct_surface', '%', 'quantiles'),
    ],
    gridded('conso_ha_gridded'),
    gridded('conso_habitat_ha_gridded'),
    gridded('conso_activite_ha_gridded'),
    gridded('conso_mixte_ha_gridded'),
    gridded('conso_route_ha_gridded'),
    gridded('conso_ferroviaire_ha_gridded'),
    gridded('conso_inconnu_ha_gridded'),
    [
        'conso_evolution_between_periods',
        drawing('territory', 'choropleth', 'conso_evolution_between_periods', '%', 'jenks'),
        drawing('communes', 'choropleth', 'conso_evolution_between_periods', '%', 'quantiles'),
    ],
    [
        'bivariate_activite_emplois',
        drawing('territory', 'bivariate', 'bivariate_activite_emplois', null, 'thresholds'),
        drawing('communes', 'bivariate', 'bivariate_activite_emplois', null, 'thresholds'),
    ],
    [
        'bivariate_habitat_menages',
        drawing('territory', 'bivariate', 'bivariate_habitat_menages', null, 'thresholds'),
        drawing('communes', 'bivariate', 'bivariate_habitat_menages', null, 'thresholds'),
    ],
    [
        'bivariate_habitat_population',
        drawing('territory', 'bivariate', 'bivariate_habitat_population', null, 'thresholds'),
        drawing('communes', 'bivariate', 'bivariate_habitat_population', null, 'thresholds'),
    ],
    [
        'conso_ha',
        drawing('territory', 'symbols', 'conso_ha', 'ha', null),
        drawing('communes', 'choropleth', 'conso_pct_surface', '%', 'quantiles', 'conso_ha'),
    ],
    [
        'conso_habitat_ha',
        drawing('territory', 'symbols', 'conso_habitat_ha', 'ha', null),
        drawing('communes', 'choropleth', 'conso_habitat_pct_surface', '%', 'quantiles', 'conso_habitat_ha'),
    ],
    [
        'conso_activite_ha',
        drawing('territory', 'symbols', 'conso_activite_ha', 'ha', null),
        drawing('communes', 'choropleth', 'conso_activite_pct_surface', '%', 'quantiles', 'conso_activite_ha'),
    ],
    gridded('artif_pct_gridded', '%'),
    [
        'artif_pct',
        drawing('territory', 'choropleth', 'artif_pct', '%', 'jenks'),
        drawing('communes', 'choropleth', 'artif_pct', '%', 'quantiles'),
    ],
    [
        'artif_ha',
        drawing('territory', 'symbols', 'artif_ha', 'ha', null),
        drawing('communes', 'choropleth', 'artif_pct', '%', 'quantiles', 'artif_ha'),
    ],
    [
        'artif_net_pct_surface',
        drawing('territory', 'choropleth', 'artif_net_pct_surface', '%', 'jenks'),
        drawing('communes', 'choropleth', 'artif_net_pct_surface', '%', 'quantiles'),
    ],
    [
        'artif_net_annual_pct_surface',
        drawing('territory', 'choropleth', 'artif_net_annual_pct_surface', '%/an', 'jenks'),
        drawing('communes', 'choropleth', 'artif_net_annual_pct_surface', '%/an', 'quantiles'),
    ],
    [
        'artif_desartif_ha',
        drawing('territory', 'rings', 'artif_desartif_ha', 'ha', null),
        drawing('communes', 'choropleth', 'artif_net_pct_surface', '%', 'quantiles', 'artif_net_ha'),
    ],
    [
        'artif_net_ha',
        drawing('territory', 'symbols', 'artif_net_ha', 'ha', null),
        drawing('communes', 'choropleth', 'artif_net_pct_surface', '%', 'quantiles', 'artif_net_ha'),
    ],
    [
        'artif_net_annual_ha',
        drawing('territory', 'symbols', 'artif_net_annual_ha', 'ha/an', null),
        drawing('communes', 'choropleth', 'artif_net_annual_pct_surface', '%/an', 'quantiles', 'artif_net_annual_ha'),
    ],
];

// Ce que le profil annonce d'une vue ; la méthode de classes se lit sur la légende du cadre
type Announced = Omit<Drawing, 'classes'>;

const announced = (view: { zone: string; scale: string }, indicator: Indicator): Announced => {
    const { renderer, mode, drawn, amountKey } = viewProfileOf(view, indicator);
    return { renderer, mode, key: drawn.key, unit: drawn.unit ?? null, amount: amountKey };
};

const expectedProfile = ({ renderer, mode, key, unit, amount }: Drawing): Announced => ({ renderer, mode, key, unit, amount });

// Ce que le cadre construit dessine vraiment
const drawnBy = ({ render, legend }: MapFrame): Pick<Drawing, 'renderer' | 'mode' | 'classes'> => {
    const methods: Record<string, ClassMethod> = { grid: 'fixed', bivariate: 'thresholds', symbols: null };
    const byValue = legend.kind === 'classes' && legend.method.includes('quantiles') ? 'quantiles' : 'jenks';
    return { renderer: render.renderer, mode: render.mode, classes: legend.kind === 'classes' ? byValue : methods[legend.kind] };
};

const isOcsge = (indicator: Indicator): boolean => indicator.source === 'ocsge';

// Cadre de la France entière par région
const territoryFrame = (indicator: Indicator): MapFrame =>
    isOcsge(indicator)
        ? artifFrame('FRANCE', FRANCE_BY_REGION, indicator.id, ARTIF_FRANCE_BY_REGION)
        : consoFrame('FRANCE', FRANCE_BY_REGION, indicator.id, CONSO_FRANCE_BY_REGION);

// Colonne d'essai telle que l'API la rendrait pour les clés ATTENDUES : si la vue en demande
// d'autres, son cadre ne se construit pas
const columnOf = (indicator: Indicator, { key, amount }: Drawing): NationalMapValues => {
    if (indicator.type === 'bivariate_map') return { ...COMMUNES_HABITAT_MENAGES, key };
    const period = indicator.usesPeriod ? { start_year: 2011, end_year: 2024 } : { start_year: null as number | null, end_year: null as number | null };
    const { amounts, ...column } = isOcsge(indicator) ? COMMUNES_ARTIF_HA : COMMUNES_CONSO_HA;
    return { ...column, ...period, key, amount, ...(amount ? { amounts } : {}) };
};

// Cadre de la France entière par commune ; les carreaux ne lisent pas de colonne
const denseFrame = (indicator: Indicator, expected: Drawing): MapFrame =>
    communesFrame('FRANCE', indicator.id, indicator.gridded ? undefined : columnOf(indicator, expected), {
        base: FRANCE_BY_DEPARTEMENT,
        conso: CONSO_FRANCE_BY_DEPARTEMENT,
        artif: ARTIF_FRANCE_BY_DEPARTEMENT,
    });

describe('profil des cartes selon la vue', () => {
    it('couvre les vingt-trois cartes du catalogue, dans son ordre', () => {
        expect(MAPS.map(([id]) => id)).toEqual(CATALOG.map((indicator) => indicator.id));
    });

    it.each(MAPS)('%s : moteur, mode, clé lue et unité sur une vue par territoire puis sur la vue dense', (id, territory, dense) => {
        const indicator = indicatorOf(id);

        expect(announced(BY_REGION, indicator)).toEqual(expectedProfile(territory));
        expect(announced(BY_COMMUNE, indicator)).toEqual(expectedProfile(dense));
        expect(announced({ zone: 'HEXAGONE', scale: 'COMM' }, indicator)).toEqual(expectedProfile(dense));
    });

    it.each(MAPS)('%s : le cadre dessine ce que le profil annonce, avec la méthode de classes attendue', (id, territory, dense) => {
        const indicator = indicatorOf(id);

        expect(drawnBy(territoryFrame(indicator))).toEqual({ renderer: territory.renderer, mode: territory.mode, classes: territory.classes });
        expect(drawnBy(denseFrame(indicator, dense))).toEqual({ renderer: dense.renderer, mode: dense.mode, classes: dense.classes });
    });

    // La légende de l'image des sols titre la grandeur de ses classes, et non la carte (voir render/grid.ts)
    const LEGEND_OWN_TITLES: Record<string, string> = { artif_pct_gridded: 'Part des sols artificialisés' };

    it.each(MAPS)('%s : la légende, l’image exportée et les lecteurs d’écran nomment la carte dessinée, comme le menu', (id, _, dense) => {
        const indicator = indicatorOf(id);
        const named = (frame: MapFrame, view: { zone: string; scale: string }): void => {
            const { label } = mapNameOf(view, indicator);
            expect(frame.legend.title).toBe(LEGEND_OWN_TITLES[id] ?? label);
            expect(frame.exportMeta.title).toBe(label);
            expect(frame.ariaLabel).toContain(`indicateur ${label}`);
        };

        named(territoryFrame(indicator), BY_REGION);
        named(denseFrame(indicator, dense), BY_COMMUNE);
    });

    it('garde le profil d’une vue par territoire pour les communes d’une région, d’un département ou d’un EPCI', () => {
        ['REGION_53', 'DEPART_35', 'EPCI_243500139'].forEach((zone) => {
            MAPS.forEach(([id, territory]) => {
                expect(announced({ zone, scale: 'COMM' }, indicatorOf(id))).toEqual(expectedProfile(territory));
            });
        });
    });

    it('ne dessine jamais d’hectares en aplat : sur la vue dense, les sept cartes en hectares passent par leur version relative', () => {
        const dense = MAPS.map(([id, , drawn]) => ({ id, ...drawn }));
        const relative = dense.filter(({ amount }) => amount !== null);

        expect(relative.map(({ id }) => id)).toEqual(CATALOG.filter(({ unit, gridded }) => !gridded && (unit === 'ha' || unit === 'ha/an')).map(({ id }) => id));
        expect(relative).toHaveLength(7);
        expect(dense.filter(({ mode, unit }) => mode !== 'grid' && (unit === 'ha' || unit === 'ha/an'))).toEqual([]);
        expect(dense.filter(({ mode }) => mode === 'symbols' || mode === 'rings')).toEqual([]);
    });

    it('dessine la carte en anneaux, sur la vue dense, comme celle de l’artificialisation nette en hectares', () => {
        const [, , rings] = MAPS.find(([id]) => id === 'artif_desartif_ha');
        const [, , net] = MAPS.find(([id]) => id === 'artif_net_ha');

        expect(rings).toEqual(net);
        expect(viewProfileOf(BY_COMMUNE, indicatorOf('artif_desartif_ha')).drawn).toEqual(viewProfileOf(BY_COMMUNE, indicatorOf('artif_net_ha')).drawn);
    });

    it('demande le fond des départements sur la vue dense, celui de la maille ailleurs', () => {
        CATALOG.forEach((indicator) => {
            expect(viewProfileOf(BY_COMMUNE, indicator).baseScale).toBe('DEPART');
            expect(viewProfileOf(BY_REGION, indicator).baseScale).toBe('REGION');
            expect(viewProfileOf({ zone: 'REGION_53', scale: 'COMM' }, indicator).baseScale).toBe('COMM');
        });
    });
});

describe('version relative déclarée par le catalogue', () => {
    const inHectares = CATALOG.filter(({ unit, gridded }) => !gridded && (unit === 'ha' || unit === 'ha/an'));

    it('accompagne chaque carte en hectares, et elle seule', () => {
        expect(CATALOG.filter(({ relative }) => relative).map(({ id }) => id)).toEqual(inHectares.map(({ id }) => id));
    });

    it('se compte en pourcentage, par an pour un rythme annuel', () => {
        inHectares.forEach(({ unit, relative }) => {
            expect(relative.unit).toBe(unit === 'ha/an' ? '%/an' : '%');
        });
    });

    it('reprend le libellé, l’unité et les décimales de la carte relative du catalogue quand il y en a une', () => {
        const twins = inHectares.flatMap((indicator) => CATALOG.filter(({ id }) => id === indicator.relative.key).map((twin) => ({ indicator, twin })));

        expect(twins.map(({ indicator, twin }) => [indicator.id, twin.id])).toEqual([
            ['conso_ha', 'conso_pct_surface'],
            ['artif_ha', 'artif_pct'],
            ['artif_desartif_ha', 'artif_net_pct_surface'],
            ['artif_net_ha', 'artif_net_pct_surface'],
            ['artif_net_annual_ha', 'artif_net_annual_pct_surface'],
        ]);
        twins.forEach(({ indicator, twin }) => {
            expect(indicator.relative).toMatchObject({ key: twin.id, label: twin.label, unit: twin.unit, decimals: twin.decimals });
            // Une valeur signée se dessine comme une évolution
            expect(viewProfileOf(BY_COMMUNE, indicator).drawn.diverging).toBe(twin.palette === 'diverging');
        });
    });
});

describe('valuesQueryOf', () => {
    const request = (changes: Partial<ViewRequest> = {}): ViewRequest => ({ zone: 'FRANCE', scale: 'COMM', startYear: 2013, endYear: 2020, indicatorId: 'conso_ha', ...changes });

    it('ne demande pas de colonne hors de la vue dense', () => {
        expect(valuesQueryOf(request({ scale: 'EPCI' }), indicatorOf('conso_ha'))).toBeNull();
        expect(valuesQueryOf(request({ zone: 'DEPART_35' }), indicatorOf('conso_ha'))).toBeNull();
    });

    it('ne demande pas de colonne pour les carreaux', () => {
        expect(valuesQueryOf(request(), indicatorOf('conso_ha_gridded'))).toBeNull();
    });

    it('demande la colonne dessinée sur la période choisie', () => {
        expect(valuesQueryOf(request(), indicatorOf('conso_pct_surface'))).toEqual({ scale: 'COMM', key: 'conso_pct_surface', start_year: 2013, end_year: 2020 });
        expect(valuesQueryOf(request(), indicatorOf('bivariate_habitat_menages'))).toEqual({ scale: 'COMM', key: 'bivariate_habitat_menages', start_year: 2013, end_year: 2020 });
    });

    it('demande les hectares avec la version relative d’une carte en hectares', () => {
        expect(valuesQueryOf(request(), indicatorOf('conso_habitat_ha'))).toEqual({
            scale: 'COMM',
            key: 'conso_habitat_pct_surface',
            amount: 'conso_habitat_ha',
            start_year: 2013,
            end_year: 2020,
        });
    });

    it('ne donne pas la période à une carte qui n’en dépend pas : en changer ne recharge rien', () => {
        expect(valuesQueryOf(request(), indicatorOf('conso_evolution_between_periods'))).toEqual({ scale: 'COMM', key: 'conso_evolution_between_periods' });
        expect(valuesQueryOf(request(), indicatorOf('artif_net_ha'))).toEqual({ scale: 'COMM', key: 'artif_net_pct_surface', amount: 'artif_net_ha' });
    });

    it('demande pour la carte en anneaux les hectares nets, que l’API sert, et non ses deux flux', () => {
        expect(valuesQueryOf(request(), indicatorOf('artif_desartif_ha'))).toEqual({ scale: 'COMM', key: 'artif_net_pct_surface', amount: 'artif_net_ha' });
    });

    it('n’accompagne les hectares d’une autre clé que l’identifiant de la carte que pour la carte en anneaux', () => {
        expect(CATALOG.filter(({ relative }) => relative?.amount).map(({ id, relative }) => [id, relative.amount])).toEqual([['artif_desartif_ha', 'artif_net_ha']]);
    });

    it('demande la même colonne pour la France entière et pour l’Hexagone', () => {
        const indicator = indicatorOf('conso_ha');

        expect(valuesQueryOf(request({ zone: 'HEXAGONE' }), indicator)).toEqual(valuesQueryOf(request(), indicator));
    });
});

describe('answersValuesQuery', () => {
    const QUERY = { scale: 'COMM', key: 'conso_pct_surface', amount: 'conso_ha', start_year: 2011, end_year: 2024 };

    it('reconnaît la réponse de la demande', () => {
        expect(answersValuesQuery(COMMUNES_CONSO_HA, QUERY)).toBe(true);
    });

    it('écarte la réponse d’une autre clé, d’une autre période ou d’une autre maille', () => {
        expect(answersValuesQuery(COMMUNES_CONSO_HA, { ...QUERY, key: 'conso_habitat_pct_surface' })).toBe(false);
        expect(answersValuesQuery(COMMUNES_CONSO_HA, { ...QUERY, start_year: 2012 })).toBe(false);
        expect(answersValuesQuery(COMMUNES_CONSO_HA, { ...QUERY, end_year: 2020 })).toBe(false);
        expect(answersValuesQuery(COMMUNES_CONSO_HA, { ...QUERY, scale: 'EPCI' })).toBe(false);
    });

    it('distingue la colonne seule de la colonne accompagnée de ses hectares', () => {
        const alone = { scale: 'COMM', key: 'conso_pct_surface', start_year: 2011, end_year: 2024 };

        expect(answersValuesQuery(COMMUNES_CONSO_HA, alone)).toBe(false);
        expect(answersValuesQuery({ ...COMMUNES_CONSO_HA, amount: null }, alone)).toBe(true);
    });

    it('n’attend pas de période d’une réponse qui n’en dépend pas', () => {
        expect(answersValuesQuery(COMMUNES_ARTIF_HA, { scale: 'COMM', key: 'artif_pct', amount: 'artif_ha' })).toBe(true);
        expect(answersValuesQuery(COMMUNES_ARTIF_HA, { scale: 'COMM', key: 'artif_pct', amount: 'artif_ha', start_year: 2011, end_year: 2024 })).toBe(false);
    });
});

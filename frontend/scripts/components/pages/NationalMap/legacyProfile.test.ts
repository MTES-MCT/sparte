import { ARTIF_FLUX_CHARTS, ARTIF_FLUX_INDICATORS, ARTIF_STOCK_CHARTS, ARTIF_STOCK_INDICATORS } from './artifIndicators';
import { CONSO_INDICATORS, Indicator, IndicatorUnit, RenderMode, renderModeOf } from './indicators';

// Profil figé des cartes et des graphiques du catalogue : ce que chaque entrée déclare et le rendu
// qui en découle. Toute réorganisation du catalogue doit le laisser intact ; le modifier, c'est
// changer ce que l'utilisateur voit. L'ordre des lignes est celui du menu : dans chaque rubrique,
// les représentations relatives d'abord, les hectares ensuite.

type Rubrique = 'conso' | 'artif_stock' | 'artif_flux';

// Listes du catalogue, dans l'ordre des rubriques du menu : les cartes de chaque rubrique, puis ses graphiques
const CATALOG: [Rubrique, Indicator[]][] = [
    ['conso', CONSO_INDICATORS],
    ['artif_stock', [...ARTIF_STOCK_INDICATORS, ...ARTIF_STOCK_CHARTS]],
    ['artif_flux', [...ARTIF_FLUX_INDICATORS, ...ARTIF_FLUX_CHARTS]],
];

type MapProfile = {
    id: string;
    rubrique: Rubrique;
    mode: RenderMode;
    unit: IndicatorUnit | null;
    decimals: number | null;
    palette: 'sequential' | 'diverging' | null;
    usesPeriod: boolean;
    source: 'ocsge' | null;
    signed: boolean;
    charts: string[];
    label: string;
};

const mapProfile = (
    id: string,
    rubrique: Rubrique,
    mode: RenderMode,
    unit: IndicatorUnit | null,
    decimals: number | null,
    palette: 'sequential' | 'diverging' | null,
    usesPeriod: boolean,
    source: 'ocsge' | null,
    signed: boolean,
    charts: string[],
    label: string,
): MapProfile => ({ id, rubrique, mode, unit, decimals, palette, usesPeriod, source, signed, charts, label });

// Graphiques d'une carte dont la période se choisit, de la carte d'évolution entre deux périodes
// de référence, et des cartes d'une destination
const PERIOD = ['conso_by_year_and_destination', 'destination_share'];
const REFERENCE = ['conso_by_year'];
const HABITAT = ['conso_habitat_by_year', 'destination_share', 'conso_and_population_by_year'];
const ACTIVITE = ['conso_activite_by_year', 'destination_share'];
// Graphiques des cartes bivariées : le nuage de points des territoires affichés, puis les deux
// grandeurs que la carte croise, dans le temps
const EMPLOIS = ['crossed_rates_scatter', 'conso_activite_by_year', 'employment_by_census'];
const MENAGES = ['crossed_rates_scatter', 'conso_and_households_by_year'];
const POPULATION = ['crossed_rates_scatter', 'conso_and_population_by_year'];
// Graphiques des cartes de l'OCS GE : ceux du stock, et ceux du flux entre deux millésimes
const STOCK = ['artif_share_by_millesime', 'artif_by_cover'];
const FLUX = ['artif_and_desartif', 'artif_flux_by_cover'];

const MAPS: MapProfile[] = [
    //         identifiant                        rubrique       mode          unité    déc.  palette      période source   signé  graphiques
    mapProfile('conso_pct_surface',               'conso',       'choropleth', '%',     2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF (en pourcentage de la surface communale)"),
    mapProfile('conso_ha_gridded',                'conso',       'grid',       'ha',    2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF (en hectares), données carroyées"),
    mapProfile('conso_habitat_ha_gridded',        'conso',       'grid',       'ha',    2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF à destination de l'habitat (en hectares), données carroyées"),
    mapProfile('conso_activite_ha_gridded',       'conso',       'grid',       'ha',    2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF à destination de l'activité (en hectares), données carroyées"),
    mapProfile('conso_mixte_ha_gridded',          'conso',       'grid',       'ha',    2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF à destination mixte (en hectares), données carroyées"),
    mapProfile('conso_route_ha_gridded',          'conso',       'grid',       'ha',    2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF à destination des routes (en hectares), données carroyées"),
    mapProfile('conso_ferroviaire_ha_gridded',    'conso',       'grid',       'ha',    2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF à destination des voies ferrées (en hectares), données carroyées"),
    mapProfile('conso_inconnu_ha_gridded',        'conso',       'grid',       'ha',    2,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF sans destination connue (en hectares), données carroyées"),
    mapProfile('conso_evolution_between_periods', 'conso',       'choropleth', '%',     1,    'diverging', false,  null,    false, REFERENCE, "Évolution de la consommation d'ENAF (en pourcentage) entre 2011-2021 et 2021-{{end}}"),
    mapProfile('bivariate_activite_emplois',      'conso',       'bivariate',  null,    null, null,        true,   null,    false, EMPLOIS, "Rythme annuel de consommation pour l'activité et évolution des emplois"),
    mapProfile('bivariate_habitat_menages',       'conso',       'bivariate',  null,    null, null,        true,   null,    false, MENAGES, "Rythme annuel de consommation pour l'habitat et évolution des ménages"),
    mapProfile('bivariate_habitat_population',    'conso',       'bivariate',  null,    null, null,        true,   null,    false, POPULATION, "Rythme annuel de consommation pour l'habitat et évolution de la population"),
    mapProfile('conso_ha',                        'conso',       'symbols',    'ha',    0,    null,        true,   null,    false, PERIOD, "Consommation d'ENAF (en hectares)"),
    mapProfile('conso_habitat_ha',                'conso',       'symbols',    'ha',    0,    null,        true,   null,    false, HABITAT, "Consommation d'ENAF à destination de l'habitat (en hectares)"),
    mapProfile('conso_activite_ha',               'conso',       'symbols',    'ha',    0,    null,        true,   null,    false, ACTIVITE, "Consommation d'ENAF à destination de l'activité (en hectares)"),
    mapProfile('artif_pct_gridded',               'artif_stock', 'grid',       '%',     0,    null,        false,  'ocsge', false, STOCK,  'Sols artificialisés'),
    mapProfile('artif_pct',                       'artif_stock', 'choropleth', '%',     1,    null,        false,  'ocsge', false, STOCK,  'Part du territoire artificialisée (en pourcentage)'),
    mapProfile('artif_ha',                        'artif_stock', 'symbols',    'ha',    0,    null,        false,  'ocsge', false, STOCK,  'Surface artificialisée (en hectares)'),
    mapProfile('artif_net_pct_surface',           'artif_flux',  'choropleth', '%',     2,    'diverging', false,  'ocsge', false, FLUX,   'Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)'),
    mapProfile('artif_net_annual_pct_surface',    'artif_flux',  'choropleth', '%/an',  3,    'diverging', false,  'ocsge', false, FLUX,   'Rythme annuel d’artificialisation nette (en pourcentage de la surface du territoire par an)'),
    mapProfile('artif_desartif_ha',               'artif_flux',  'rings',      'ha',    1,    null,        false,  'ocsge', true,  FLUX,   'Artificialisation et désartificialisation entre les deux derniers millésimes (en hectares)'),
    mapProfile('artif_net_ha',                    'artif_flux',  'symbols',    'ha',    1,    null,        false,  'ocsge', true,  FLUX,   'Artificialisation nette entre les deux derniers millésimes (en hectares)'),
    mapProfile('artif_net_annual_ha',             'artif_flux',  'symbols',    'ha/an', 1,    null,        false,  'ocsge', true,  FLUX,   'Rythme annuel d’artificialisation nette (en hectares par an)'),
];

const CHARTS = [
    { id: 'crossed_rates_scatter', rubrique: 'conso', label: 'Territoires affichés selon les deux taux que la carte croise (nuage de points)' },
    { id: 'conso_by_year_and_destination', rubrique: 'conso', label: "Consommation d'ENAF (en hectares) par année et par destination" },
    { id: 'conso_habitat_by_year', rubrique: 'conso', label: "Consommation d'ENAF à destination de l'habitat (en hectares), par année" },
    { id: 'conso_activite_by_year', rubrique: 'conso', label: "Consommation d'ENAF à destination de l'activité (en hectares), par année" },
    { id: 'conso_by_year', rubrique: 'conso', label: "Consommation d'ENAF (en hectares) par année depuis 2011 et rythme moyen des deux périodes" },
    { id: 'destination_share', rubrique: 'conso', label: "Répartition de la consommation d'ENAF par destination" },
    { id: 'conso_and_population_by_year', rubrique: 'conso', label: "Consommation d'ENAF (en hectares) et population, par année" },
    { id: 'conso_and_households_by_year', rubrique: 'conso', label: "Consommation d'ENAF (en hectares) et nombre de ménages, par année" },
    { id: 'employment_by_census', rubrique: 'conso', label: 'Emploi et chômage des 15-64 ans aux recensements de 2011, 2016 et 2022' },
    { id: 'artif_share_by_millesime', rubrique: 'artif_stock', label: 'Part du territoire artificialisée aux deux derniers millésimes' },
    { id: 'artif_by_cover', rubrique: 'artif_stock', label: 'Surfaces artificialisées par type de couverture du sol' },
    { id: 'artif_and_desartif', rubrique: 'artif_flux', label: 'Artificialisation, désartificialisation et artificialisation nette (en hectares)' },
    { id: 'artif_flux_by_cover', rubrique: 'artif_flux', label: 'Artificialisation et désartificialisation par type de couverture du sol (en hectares)' },
];

const catalogMaps = (): MapProfile[] =>
    CATALOG.flatMap(([rubrique, indicators]) =>
        indicators
            .filter((indicator) => indicator.type !== 'chart')
            .map((indicator) => ({
                id: indicator.id,
                rubrique,
                mode: renderModeOf(indicator),
                unit: indicator.unit ?? null,
                decimals: indicator.decimals ?? null,
                palette: indicator.palette ?? null,
                usesPeriod: Boolean(indicator.usesPeriod),
                source: indicator.source ?? null,
                signed: Boolean(indicator.signed),
                charts: indicator.charts ?? [],
                label: indicator.label,
            })),
    );

describe('profil du catalogue des indicateurs', () => {
    it('décrit les vingt-trois cartes, dans l’ordre du catalogue', () => {
        expect(catalogMaps()).toEqual(MAPS);
    });

    it('décrit les treize graphiques complémentaires : neuf pour la consommation, deux pour chaque rubrique de l’OCS GE', () => {
        const charts = CATALOG.flatMap(([rubrique, indicators]) =>
            indicators.filter((indicator) => indicator.type === 'chart').map(({ id, label }) => ({ id, rubrique, label })),
        );
        expect(charts).toEqual(CHARTS);
    });

    it('répartit les cartes en six cartes en cercles, une en anneaux, cinq aplats, trois bivariées et huit cartes de mailles', () => {
        const maps = catalogMaps();
        const count = (mode: RenderMode) => maps.filter((map) => map.mode === mode).length;
        expect({ symbols: count('symbols'), rings: count('rings'), choropleth: count('choropleth'), bivariate: count('bivariate'), grid: count('grid') }).toEqual({
            symbols: 6,
            rings: 1,
            choropleth: 5,
            bivariate: 3,
            grid: 8,
        });
        expect(maps.filter((map) => map.signed).map((map) => [map.id, map.mode])).toEqual([
            ['artif_desartif_ha', 'rings'],
            ['artif_net_ha', 'symbols'],
            ['artif_net_annual_ha', 'symbols'],
        ]);
        expect(maps.filter((map) => map.palette === 'diverging').map((map) => [map.id, map.mode])).toEqual([
            ['conso_evolution_between_periods', 'choropleth'],
            ['artif_net_pct_surface', 'choropleth'],
            ['artif_net_annual_pct_surface', 'choropleth'],
        ]);
    });

    it('range, dans chaque rubrique, les représentations relatives avant les cartes en hectares', () => {
        const absolute = (map: MapProfile): boolean => map.mode === 'symbols' || map.mode === 'rings';
        CATALOG.forEach(([rubrique]) => {
            const kinds = catalogMaps()
                .filter((map) => map.rubrique === rubrique)
                .map(absolute);
            // Aucune carte en hectares avant la dernière carte relative
            expect(kinds.slice(0, kinds.lastIndexOf(false) + 1)).not.toContain(true);
        });
    });

    it('ouvre chaque rubrique sur une représentation relative', () => {
        expect(CATALOG.map(([, indicators]) => indicators[0].id)).toEqual(['conso_pct_surface', 'artif_pct_gridded', 'artif_net_pct_surface']);
    });

    it('ne représente jamais des hectares en aplat de couleur par territoire', () => {
        const absolute = catalogMaps().filter((map) => map.unit === 'ha' || map.unit === 'ha/an');
        expect(absolute.filter((map) => map.mode === 'choropleth' || map.mode === 'bivariate')).toEqual([]);
    });
});

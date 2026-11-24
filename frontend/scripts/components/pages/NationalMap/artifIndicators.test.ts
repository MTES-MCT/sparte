import type { NationalMapArtifLand } from '@services/api';
import {
    ARTIF_FLUX_INDICATORS,
    ARTIF_INDICATORS,
    ARTIF_STOCK_INDICATORS,
    artifFootnote,
    artifTotals,
    artifValueNote,
    findArtifIndicator,
    isArtifFluxIndicator,
} from './artifIndicators';
import { CONSO_INDICATORS, renderModeOf, usesSymbols } from './indicators';

const land = (overrides: Partial<NationalMapArtifLand> = {}): NationalMapArtifLand => ({
    surface_ha: 10000,
    artif_ha: 1000,
    artif_pct: 10,
    artif_years: [2021],
    artif_index: 2,
    artif_net_ha: 30,
    artif_net_pct_surface: 0.3,
    artif_net_annual_ha: 10,
    artif_net_annual_pct_surface: 0.1,
    artif_gross_ha: 40,
    desartif_gross_ha: 10,
    artif_net_years_old: [2018],
    artif_net_years_new: [2021],
    artif_net_index_old: 1,
    artif_net_index_new: 2,
    ...overrides,
});

const noData = (): NationalMapArtifLand =>
    land({
        artif_ha: null,
        artif_pct: null,
        artif_years: [],
        artif_index: null,
        artif_net_ha: null,
        artif_net_pct_surface: null,
        artif_net_annual_ha: null,
        artif_net_annual_pct_surface: null,
        artif_gross_ha: null,
        desartif_gross_ha: null,
        artif_net_years_old: [],
        artif_net_years_new: [],
        artif_net_index_old: null,
        artif_net_index_new: null,
    });

const stock = ARTIF_STOCK_INDICATORS[0];
const annualPct = ARTIF_FLUX_INDICATORS.find((i) => i.id === 'artif_net_annual_pct_surface')!;
const rings = ARTIF_FLUX_INDICATORS.find((i) => i.id === 'artif_desartif_ha')!;

describe('déclaration des indicateurs', () => {
    it('réserve les aplats, par territoire ou par maille, aux valeurs relatives, et les cercles ou les anneaux aux hectares', () => {
        ARTIF_INDICATORS.forEach((indicator) => {
            const absolute = indicator.unit === 'ha' || indicator.unit === 'ha/an';
            expect(['choropleth', 'grid'].includes(renderModeOf(indicator))).toBe(!absolute);
        });
    });

    it('ne dessine en mailles que la carte des sols artificialisés, rangée avant les cartes par territoire', () => {
        expect(ARTIF_INDICATORS.filter((indicator) => renderModeOf(indicator) === 'grid').map(({ id }) => id)).toEqual(['artif_soils']);
        expect(ARTIF_STOCK_INDICATORS.map(({ id }) => id)).toEqual(['artif_soils', 'artif_pct']);
    });

    it('ne partage en anneaux que la carte des deux flux, que des cercles ne dessinent pas', () => {
        expect(ARTIF_INDICATORS.filter((indicator) => renderModeOf(indicator) === 'rings').map(({ id }) => id)).toEqual(['artif_desartif_ha']);
        expect(usesSymbols(rings)).toBe(false);
    });

    it('utilise des classes de part et d’autre de zéro pour les flux relatifs, et des symboles signés pour les flux en hectares', () => {
        ARTIF_FLUX_INDICATORS.forEach((indicator) => {
            if (renderModeOf(indicator) === 'choropleth') expect(indicator.palette).toBe('diverging');
            else expect(indicator.signed).toBe(true);
        });
        ARTIF_STOCK_INDICATORS.forEach((indicator) => {
            expect(indicator.palette).toBeUndefined();
            expect(indicator.signed).toBeUndefined();
        });
    });

    it('ne dépend pas de la période et vient de l’OCS GE', () => {
        ARTIF_INDICATORS.forEach((indicator) => {
            expect(indicator.usesPeriod).toBeUndefined();
            expect(indicator.source).toBe('ocsge');
        });
    });

    it('a des identifiants distincts de ceux de la consommation', () => {
        const ids = [...ARTIF_INDICATORS, ...CONSO_INDICATORS].map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('retrouve un indicateur par son identifiant', () => {
        expect(findArtifIndicator('artif_desartif_ha')?.unit).toBe('ha');
        expect(findArtifIndicator('conso_ha')).toBeUndefined();
        expect(findArtifIndicator(null)).toBeUndefined();
        expect(isArtifFluxIndicator(rings)).toBe(true);
        expect(isArtifFluxIndicator(stock)).toBe(false);
    });
});

describe('artifValueNote', () => {
    it('précise le millésime du stock, par son index puis son année', () => {
        expect(artifValueNote(land(), stock)).toBe(' au millésime n°2 (2021)');
        expect(artifValueNote(land({ artif_years: [2021, 2023] }), stock)).toBe(' au millésime n°2 (2021 à 2023)');
    });

    it('précise les deux millésimes du flux', () => {
        expect(artifValueNote(land(), annualPct)).toBe(' entre le millésime n°1 (2018) et le millésime n°2 (2021)');
        expect(artifValueNote(land(), rings)).toBe(' entre le millésime n°1 (2018) et le millésime n°2 (2021)');
        expect(artifValueNote(land({ artif_net_years_old: [2017, 2018] }), rings)).toBe(' entre le millésime n°1 (2017 à 2018) et le millésime n°2 (2021)');
    });

    it('ne dit rien pour un territoire sans donnée', () => {
        expect(artifValueNote(noData(), stock)).toBe('');
        expect(artifValueNote(noData(), annualPct)).toBe('');
    });
});

describe('artifFootnote', () => {
    it('donne le millésime, l’étendue de ses années et la mise en garde pour le stock', () => {
        const text = artifFootnote([land(), land({ artif_years: [2019] }), land({ artif_years: [2023] })], stock);
        expect(text).toBe(
            'Source : OCS GE (IGN). Valeurs au millésime n°2 (2019 à 2023). Les années diffèrent selon les départements : les valeurs ne sont pas strictement comparables d’un territoire à l’autre.',
        );
    });

    it('ne met pas en garde quand tous les territoires ont le même millésime, la même année', () => {
        expect(artifFootnote([land(), land()], stock)).toBe('Source : OCS GE (IGN). Valeurs au millésime n°2 (2021).');
    });

    it('dit ce que la carte montre quand le dernier millésime n’a pas le même index partout', () => {
        const text = artifFootnote([land(), land({ artif_years: [2024], artif_index: 3 })], stock);
        expect(text).toContain('Valeurs au dernier millésime de chaque territoire : n°2 (2021) ou n°3 (2024).');
        expect(text).toContain('ne sont pas strictement comparables');
    });

    it('donne les deux millésimes et l’étendue de leurs années pour le flux', () => {
        const text = artifFootnote([land(), land({ artif_net_years_old: [2016], artif_net_years_new: [2019] })], rings);
        expect(text).toContain('Évolution mesurée entre le millésime n°1 (2016 à 2018) et le millésime n°2 (2019 à 2021).');
        expect(text).toContain('ne sont pas strictement comparables');
        expect(text).not.toContain('rythme annuel');
    });

    it('explique le rythme annuel sur la carte qui en dessine un', () => {
        expect(artifFootnote([land()], annualPct)).toContain(
            'entre le millésime n°1 (2018) et le millésime n°2 (2021). Le rythme annuel divise le flux de chaque département par la durée entre ses deux millésimes.',
        );
    });

    it('compte les territoires qui n’ont qu’un millésime, où aucune évolution ne se mesure', () => {
        const single = land({ artif_index: 1, artif_net_ha: null, artif_net_years_old: [], artif_net_years_new: [], artif_net_index_old: null, artif_net_index_new: null });
        expect(artifFootnote([land(), single], rings)).toContain(' Un territoire n’a qu’un millésime (hachurés) : il en faut deux pour mesurer une évolution.');
        expect(artifFootnote([single, single], rings)).toBe(
            'Source : OCS GE (IGN). 2 territoires n’ont qu’un millésime (hachurés) : il en faut deux pour mesurer une évolution.',
        );
        // Une carte de stock les montre : elle n'a rien à en dire
        expect(artifFootnote([land(), single], stock)).not.toContain('qu’un millésime');
    });

    it('nomme ce qui est au millésime annoncé quand ce n’est pas toute la carte', () => {
        expect(artifFootnote([land()], stock, [], 'Chiffres')).toBe('Source : OCS GE (IGN). Chiffres au millésime n°2 (2021).');
    });

    it('nomme les territoires sans donnée, ou les compte s’ils sont nombreux', () => {
        expect(artifFootnote([land(), noData()], stock, ['Guyane'])).toContain('Donnée non disponible pour Guyane (hachurés)');
        const many = Array.from({ length: 22 }, (_, i) => `Commune ${i}`);
        expect(artifFootnote([land()], stock, many)).toContain('Donnée non disponible pour 22 territoires (hachurés)');
    });

    it('le dit quand aucun territoire n’a de donnée', () => {
        expect(artifFootnote([noData()], stock, ['Guyane'])).toBe(
            'Source : OCS GE (IGN). Donnée non disponible pour Guyane (hachurés) : la couverture OCS GE y est incomplète.',
        );
        expect(artifFootnote([], stock)).toContain('Aucune donnée');
    });
});

describe('artifTotals', () => {
    it('somme les territoires renseignés et recalcule la part sur leur seule superficie', () => {
        const totals = artifTotals([
            land(),
            land({ surface_ha: 30000, artif_ha: 1000, artif_net_ha: -10, artif_net_annual_ha: -5, artif_years: [2023], artif_net_years_old: [2020], artif_net_years_new: [2023] }),
            noData(),
        ]);
        expect(totals.withData).toBe(2);
        expect(totals.withoutData).toBe(1);
        expect(totals.artifHa).toBe(2000);
        expect(totals.artifPct).toBeCloseTo(5);
        expect(totals.netHa).toBe(20);
        expect(totals.annualNetHa).toBe(5);
        expect(totals.grossArtifHa).toBe(80);
        expect(totals.grossDesartifHa).toBe(20);
    });

    it('renvoie des valeurs nulles sans territoire renseigné', () => {
        const totals = artifTotals([noData()]);
        expect(totals).toEqual({
            withData: 0,
            withoutData: 1,
            artifHa: null,
            artifPct: null,
            netHa: null,
            annualNetHa: null,
            grossArtifHa: null,
            grossDesartifHa: null,
        });
        expect(artifTotals([]).withoutData).toBe(0);
    });
});

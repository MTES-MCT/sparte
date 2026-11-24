import type { NationalMapBaseMap } from '@services/api';
import {
    COMMUNES_ARTIF_SHARE,
    COMMUNES_CONSO_EVOLUTION,
    COMMUNES_CONSO_HA,
    COMMUNES_CONSO_SHARE,
    COMMUNES_HABITAT_MENAGES,
} from '../../__fixtures__/communesFixtures';
import {
    ARTIF_FRANCE_BY_DEPARTEMENT,
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_REGION_IN_2024,
    FRANCE_BY_DEPARTEMENT,
    FRANCE_BY_REGION,
} from '../../__fixtures__/nationalMapFixtures';
import { artifFrame, consoFrame, indicatorOf } from '../../__fixtures__/frames';
import { CONSO_FRANCE_BY_TWELVE_REGIONS, FRANCE_BY_TWELVE_REGIONS, TWELVE_REGIONS } from '../../__fixtures__/scatterFixtures';
import type { ViewRequest } from '../viewState';
import { FrameInput, buildFrame, viewErrorOf } from './buildFrame';

const FRANCE: ViewRequest = { zone: 'FRANCE', scale: 'REGION', startYear: 2011, endYear: 2024, indicatorId: 'conso_ha' };
const CONSO = indicatorOf('conso_ha');
const ARTIF = indicatorOf('artif_pct');

// Vue complète de la France entière par région, modifiable champ par champ
const france = (changes: Partial<FrameInput> = {}): FrameInput => ({ request: FRANCE, indicator: CONSO, base: FRANCE_BY_REGION, conso: CONSO_FRANCE_BY_REGION, ...changes });

describe('buildFrame', () => {
    it('assemble le cadre de la vue demandée quand le fond et les données sont ceux de la demande', () => {
        const frame = buildFrame(france());

        expect(frame).toMatchObject({
            key: 'FRANCE|REGION|conso_ha|2011-2024',
            indicator: CONSO,
            data: { source: 'conso', response: CONSO_FRANCE_BY_REGION },
            period: { startYear: 2011, endYear: 2024 },
        });
        expect(frame.base).toMatchObject({ key: 'FRANCE|REGION', title: 'France entière' });
    });

    it('ne rend rien sans le fond de carte', () => {
        expect(buildFrame(france({ base: undefined }))).toBeNull();
    });

    it('ne rend rien sans les données que l’indicateur lit', () => {
        expect(buildFrame(france({ conso: undefined }))).toBeNull();
        expect(buildFrame(france({ indicator: ARTIF }))).toBeNull();
    });

    it('ne rend rien avec le fond d’une autre maille', () => {
        expect(buildFrame(france({ base: FRANCE_BY_DEPARTEMENT }))).toBeNull();
    });

    it('ne rend rien avec le fond d’un autre parent', () => {
        expect(buildFrame(france({ base: { ...BRETAGNE_BY_DEPARTEMENT, scale: 'REGION' } }))).toBeNull();
        expect(buildFrame(france({ request: { ...FRANCE, zone: 'REGION_53', scale: 'DEPART' }, base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT }))).toBeNull();
        const otherRegion: NationalMapBaseMap = { ...BRETAGNE_BY_DEPARTEMENT, parent: { ...BRETAGNE_BY_DEPARTEMENT.parent, land_id: '75' } };
        expect(buildFrame(france({ request: { ...FRANCE, zone: 'REGION_53', scale: 'DEPART' }, base: otherRegion, conso: CONSO_BRETAGNE_BY_DEPARTEMENT }))).toBeNull();
    });

    it('ne rend rien avec les données d’une autre maille : deux territoires de même code ne se mélangent pas', () => {
        // Les régions 75 et 84 partagent leur code avec Paris et le Vaucluse
        expect(buildFrame(france({ conso: CONSO_FRANCE_BY_DEPARTEMENT }))).toBeNull();
        expect(buildFrame(france({ indicator: ARTIF, artif: { ...ARTIF_FRANCE_BY_REGION, scale: 'DEPART' } }))).toBeNull();
    });

    it('ne rend rien avec les données d’une autre période', () => {
        expect(buildFrame(france({ conso: CONSO_FRANCE_BY_REGION_IN_2024 }))).toBeNull();
    });

    it('n’attend pas la consommation pour une carte OCS GE, et ne la lit pas', () => {
        const alone = buildFrame(france({ indicator: ARTIF, conso: undefined, artif: ARTIF_FRANCE_BY_REGION }));
        const withConsoOfAnotherView = buildFrame(france({ indicator: ARTIF, conso: CONSO_FRANCE_BY_DEPARTEMENT, artif: ARTIF_FRANCE_BY_REGION }));

        expect(alone).toMatchObject({ key: 'FRANCE|REGION|artif_pct', data: { source: 'artif', response: ARTIF_FRANCE_BY_REGION }, period: null });
        expect(withConsoOfAnotherView).toEqual(alone);
    });

    it('n’attend pas l’artificialisation pour une carte de consommation', () => {
        expect(buildFrame(france({ artif: undefined }))).not.toBeNull();
        expect(buildFrame(france({ artif: { ...ARTIF_FRANCE_BY_REGION, scale: 'DEPART' } }))?.data.source).toBe('conso');
    });

    it('garde le même fond pour deux vues qui ne diffèrent que par l’indicateur ou la période', () => {
        const hectares = buildFrame(france());
        const share = buildFrame(france({ indicator: indicatorOf('conso_pct_surface') }));
        const in2024 = buildFrame(france({ request: { ...FRANCE, startYear: 2024 }, conso: CONSO_FRANCE_BY_REGION_IN_2024 }));

        expect(share.base).toBe(hectares.base);
        expect(in2024.base).toBe(hectares.base);
        expect(new Set([hectares.key, share.key, in2024.key]).size).toBe(3);
    });

    it('distingue la France entière de l’Hexagone, qui partagent leur fond de carte', () => {
        const whole = buildFrame(france());
        const hexagone = buildFrame(france({ request: { ...FRANCE, zone: 'HEXAGONE' } }));

        expect(hexagone.base.key).not.toBe(whole.base.key);
        expect(hexagone.key).not.toBe(whole.key);
        expect(hexagone.base.features).toHaveLength(4);
    });
});

describe('ce que le cadre dit de la vue', () => {
    const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');
    const bretagne = (indicatorId: string) => consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, indicatorId, CONSO_BRETAGNE_BY_DEPARTEMENT);

    it('choisit la représentation d’après l’indicateur : cercles, aplat, croisement ou carreaux', () => {
        const modes = ['conso_ha', 'conso_pct_surface', 'bivariate_habitat_menages', 'conso_ha_gridded'].map((indicatorId) => {
            const { render, legend } = bretagne(indicatorId);
            return [render.renderer, render.mode, legend.kind];
        });

        expect(modes).toEqual([
            ['territory', 'symbols', 'symbols'],
            ['territory', 'choropleth', 'classes'],
            ['territory', 'bivariate', 'bivariate'],
            ['grid', 'grid', 'grid'],
        ]);
    });

    it('nomme l’image exportée d’après la zone, la maille et l’indicateur, avec la période et les crédits de la source', () => {
        expect(bretagne('conso_pct_surface').exportMeta).toEqual({
            title: "Consommation d'ENAF (en pourcentage de la surface communale)",
            subtitle: 'Bretagne · par département · de 2011 à 2024',
            filename: 'carte-region_53-depart-conso_pct_surface',
            credits: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)',
            unitLabel: '%',
        });
    });

    it('précise dans le sous-titre de l’export ce que représentent les cercles', () => {
        expect(plain(bretagne('conso_ha').exportMeta.subtitle)).toBe(
            'Bretagne · par département · de 2011 à 2024 · surface des cercles proportionnelle à la valeur (maximum : 6 802 ha)',
        );
    });

    it('choisit les anneaux pour la carte des deux flux d’artificialisation, avec la légende des symboles', () => {
        const { render, legend } = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', ARTIF_FRANCE_BY_REGION);

        expect([render.renderer, render.mode, legend.kind]).toEqual(['territory', 'rings', 'symbols']);
    });

    it('précise dans le sous-titre de l’export ce que représentent les anneaux et leurs couleurs, que l’image montre sans légende', () => {
        expect(plain(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', ARTIF_FRANCE_BY_REGION).exportMeta.subtitle)).toBe(
            'France entière · par région · Millésimes n°1 (2017 à 2020) et n°2 (2020 à 2023) · surface des anneaux proportionnelle à la somme des deux flux (maximum : 13 897,6 ha) · ' +
                'artificialisation en rouge, désartificialisation en bleu',
        );
    });

    it('donne à l’export d’une carte OCS GE ses millésimes à la place de la période, et crédite l’IGN', () => {
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct', ARTIF_FRANCE_BY_REGION).exportMeta).toMatchObject({
            subtitle: 'France entière · par région · Millésime n°2 (2020 à 2023)',
            filename: 'carte-france-region-artif_pct',
            credits: 'Mon Diagnostic Artificialisation · données IGN (OCS GE)',
        });
    });

    it('décrit l’export d’une carte carroyée par ses carreaux, sans la maille des territoires', () => {
        expect(consoFrame('HEXAGONE', FRANCE_BY_REGION, 'conso_ha_gridded', CONSO_FRANCE_BY_REGION).exportMeta).toEqual({
            title: "Consommation d'ENAF (en hectares), données carroyées",
            subtitle: 'Hexagone · carreaux de 1 km × 1 km · de 2011 à 2024',
            filename: 'carte-hexagone-conso_ha_gridded',
            credits: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)',
        });
    });

    it('nomme la destination dans le titre et le fichier de l’export d’une carte carroyée', () => {
        expect(bretagne('conso_ferroviaire_ha_gridded').exportMeta).toEqual({
            title: "Consommation d'ENAF à destination des voies ferrées (en hectares), données carroyées",
            subtitle: 'Bretagne · carreaux de 1 km × 1 km · de 2011 à 2024',
            filename: 'carte-region_53-conso_ferroviaire_ha_gridded',
            credits: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)',
        });
    });

    it('décrit la carte aux lecteurs d’écran', () => {
        expect(buildFrame(france()).ariaLabel).toBe(
            "Carte de la France entière par territoire, indicateur Consommation d'ENAF (en hectares). Les régions d'outre-mer sont placées à gauche de l'Hexagone.",
        );
        expect(bretagne('conso_ha').ariaLabel).toBe("Carte de la zone Bretagne par territoire, indicateur Consommation d'ENAF (en hectares).");
        expect(bretagne('conso_ha_gridded').ariaLabel).toBe(
            "Carte de la zone Bretagne, indicateur Consommation d'ENAF (en hectares), données carroyées, par carreau de 1 km × 1 km de 2011 à 2024.",
        );
        expect(bretagne('conso_habitat_ha_gridded').ariaLabel).toBe(
            "Carte de la zone Bretagne, indicateur Consommation d'ENAF à destination de l'habitat (en hectares), données carroyées, par carreau de 1 km × 1 km de 2011 à 2024.",
        );
    });

    describe('carte des sols artificialisés par maille', () => {
        const SOILS = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_soils', ARTIF_FRANCE_BY_REGION);

        it('lit l’artificialisation des territoires affichés, sans période dans son identité', () => {
            expect(SOILS).toMatchObject({ key: 'FRANCE|REGION|artif_soils', period: null, data: { source: 'artif' }, render: { renderer: 'grid', mode: 'grid' } });
            expect(SOILS.shownOcsge).not.toBeNull();
            expect(SOILS.scatter).toBeNull();
        });

        it('a les chiffres clés des cartes de stock, sur les territoires affichés', () => {
            expect(SOILS.keyFigures).toEqual(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct', ARTIF_FRANCE_BY_REGION).keyFigures);
        });

        it('décrit son export par ses mailles et crédite l’IGN', () => {
            expect(SOILS.exportMeta).toEqual({
                title: 'Sols artificialisés',
                subtitle: 'France entière · part artificialisée par maille · dernier millésime OCS GE de chaque département',
                detailSubtitle: 'France entière · objets OCS GE, artificialisés ou non · dernier millésime de chaque département',
                imageSubtitle: "France entière · image de l'OCS GE (IGN), sols artificialisés ou non · génération 2021-2023",
                filename: 'carte-france-artif_soils',
                credits: 'Mon Diagnostic Artificialisation · données IGN (OCS GE)',
            });
        });

        it('se décrit aux lecteurs d’écran sans période', () => {
            expect(SOILS.ariaLabel).toBe(
                'Carte de la zone France entière, indicateur Sols artificialisés, par maille carrée, au dernier millésime OCS GE de chaque département.',
            );
        });

        it('se dessine sur le fond des départements pour toutes les communes du pays, sans colonne de valeurs', () => {
            const frame = buildFrame({
                request: { zone: 'FRANCE', scale: 'COMM', startYear: 2011, endYear: 2024, indicatorId: 'artif_soils' },
                indicator: indicatorOf('artif_soils'),
                base: FRANCE_BY_DEPARTEMENT,
                artif: ARTIF_FRANCE_BY_DEPARTEMENT,
            });

            expect(frame).toMatchObject({ key: 'FRANCE|COMM|artif_soils', communes: null, render: { renderer: 'grid', features: FRANCE_BY_DEPARTEMENT.geojson.features } });
        });
    });

    it('accompagne la carte des graphiques du territoire, ou de la nation pour la France entière et l’Hexagone', () => {
        expect(bretagne('conso_ha').chartsLand).toEqual({ land_type: 'REGION', land_id: '53' });
        expect(buildFrame(france()).chartsLand).toEqual({ land_type: 'NATION', land_id: 'NATION' });
        expect(buildFrame(france({ request: { ...FRANCE, zone: 'HEXAGONE' } })).chartsLand).toEqual({ land_type: 'NATION', land_id: 'NATION' });
    });
});

describe('nuage de points des territoires affichés par une carte bivariée', () => {
    const bretagne = (indicatorId: string) => consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, indicatorId, CONSO_BRETAGNE_BY_DEPARTEMENT);
    const twelve = () => consoFrame('FRANCE', FRANCE_BY_TWELVE_REGIONS, 'bivariate_habitat_menages', CONSO_FRANCE_BY_TWELVE_REGIONS);

    it('n’existe pas pour une carte qui ne croise pas deux taux', () => {
        expect(bretagne('conso_ha').scatter).toBeNull();
        expect(bretagne('conso_pct_surface').scatter).toBeNull();
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct', ARTIF_FRANCE_BY_REGION).scatter).toBeNull();
    });

    it('n’est pas dessiné sous dix territoires affichés, et le cadre dit pourquoi', () => {
        expect(bretagne('bivariate_habitat_menages').scatter).toEqual({ kind: 'none', reason: "Le nuage de points n'est pas dessiné pour moins de dix territoires." });
    });

    it('n’est pas dessiné pour toutes les communes du pays', () => {
        const dense = buildFrame({
            request: { zone: 'FRANCE', scale: 'COMM', startYear: 2011, endYear: 2024, indicatorId: 'bivariate_habitat_menages' },
            indicator: indicatorOf('bivariate_habitat_menages'),
            base: FRANCE_BY_DEPARTEMENT,
            conso: CONSO_FRANCE_BY_DEPARTEMENT,
            values: COMMUNES_HABITAT_MENAGES,
        });

        expect(dense.scatter).toEqual({ kind: 'none', reason: "Le nuage de points n'est pas dessiné pour l'ensemble des communes du pays." });
    });

    it('place les territoires de la carte affichée, avec la couleur et le texte que la carte leur donne', () => {
        const frame = twelve();
        if (frame.scatter?.kind !== 'points' || frame.render.renderer !== 'territory') throw new Error('nuage de points attendu');
        const { points, title, x, y } = frame.scatter.model;
        const byLand = new Map(frame.render.points.map((point) => [point.land_id, point]));

        expect(title).toBe('Un point par région - France entière (2011 - 2024)');
        expect(points.map((point) => point.land_id)).toEqual(TWELVE_REGIONS);
        points.forEach((point) => {
            const { color, legendKey, valueText, name } = byLand.get(point.land_id);
            expect([point.color, point.legendKey, point.valueText, point.name]).toEqual([color, legendKey, valueText, name]);
        });
        expect(points[5]).toMatchObject({ x: 0.8, y: 0.02 });
        expect(x.thresholds).toEqual(CONSO_FRANCE_BY_REGION.bivariate.bivariate_habitat_menages.indic_thresholds);
        expect(y.thresholds).toEqual(CONSO_FRANCE_BY_REGION.bivariate.bivariate_habitat_menages.conso_thresholds);
    });

    it('n’est pas dessiné pour une période sans seuils', () => {
        const withoutThresholds = { ...CONSO_FRANCE_BY_TWELVE_REGIONS, bivariate: CONSO_FRANCE_BY_REGION_IN_2024.bivariate };
        const frame = consoFrame('FRANCE', FRANCE_BY_TWELVE_REGIONS, 'bivariate_habitat_menages', withoutThresholds);

        expect(frame.scatter).toEqual({ kind: 'none', reason: "Le nuage de points n'est pas dessiné : la carte n'a pas de classes sur cette période." });
    });
});

describe('étendue des territoires affichés, que les graphiques d’une carte OCS GE comparent à la zone qu’ils décrivent', () => {
    it('ne la donne pas pour une carte de consommation', () => {
        expect(consoFrame('FRANCE', FRANCE_BY_REGION, 'conso_ha', CONSO_FRANCE_BY_REGION).shownOcsge).toBeNull();
    });

    it('somme la surface de tous les territoires affichés, et signale ceux qui sont sans donnée', () => {
        const { lands } = ARTIF_FRANCE_BY_REGION;
        const surfaceHa = FRANCE_BY_REGION.geojson.features.reduce((total, feature) => total + lands[feature.properties.land_id].surface_ha, 0);

        // La Guyane, sans couverture OCS GE complète, est comptée dans la surface
        expect(surfaceHa).toBeGreaterThan(lands['03'].surface_ha);
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct', ARTIF_FRANCE_BY_REGION).shownOcsge).toEqual({ surfaceHa, hasMissing: true });
    });

    it('ne compte que les territoires de la zone : l’Hexagone, sans la Corse ni l’outre-mer', () => {
        const { lands } = ARTIF_FRANCE_BY_REGION;
        const surfaceHa = ['11', '53', '75', '84'].reduce((total, id) => total + lands[id].surface_ha, 0);

        expect(artifFrame('HEXAGONE', FRANCE_BY_REGION, 'artif_desartif_ha', ARTIF_FRANCE_BY_REGION).shownOcsge).toEqual({ surfaceHa, hasMissing: false });
    });

    it('ne signale rien quand tous les territoires affichés ont des données', () => {
        expect(artifFrame('FRANCE', FRANCE_BY_DEPARTEMENT, 'artif_pct', ARTIF_FRANCE_BY_DEPARTEMENT).shownOcsge.hasMissing).toBe(false);
    });
});

describe('cadre de toutes les communes d’une zone nationale', () => {
    const BY_COMMUNE: ViewRequest = { zone: 'FRANCE', scale: 'COMM', startYear: 2011, endYear: 2024, indicatorId: 'conso_ha' };
    const BY_DEPARTEMENT: ViewRequest = { ...BY_COMMUNE, scale: 'DEPART' };
    const GRID = indicatorOf('conso_ha_gridded');
    const EVOLUTION = indicatorOf('conso_evolution_between_periods');

    // Vue complète de la France entière par commune, carte en hectares, modifiable champ par champ
    const communes = (changes: Partial<FrameInput> = {}): FrameInput => ({
        request: BY_COMMUNE,
        indicator: CONSO,
        base: FRANCE_BY_DEPARTEMENT,
        conso: CONSO_FRANCE_BY_DEPARTEMENT,
        values: COMMUNES_CONSO_HA,
        ...changes,
    });
    const departements = (changes: Partial<FrameInput> = {}): FrameInput => ({
        request: BY_DEPARTEMENT,
        indicator: CONSO,
        base: FRANCE_BY_DEPARTEMENT,
        conso: CONSO_FRANCE_BY_DEPARTEMENT,
        ...changes,
    });

    it('se construit du fond et des données des départements, et de la colonne de valeurs des communes', () => {
        const frame = buildFrame(communes());

        expect(frame).toMatchObject({
            key: 'FRANCE|COMM|conso_ha|2011-2024',
            data: { source: 'conso', response: CONSO_FRANCE_BY_DEPARTEMENT },
            period: { startYear: 2011, endYear: 2024 },
            render: { renderer: 'communes', mode: 'choropleth' },
        });
        expect(frame.communes).toBe(COMMUNES_CONSO_HA);
        expect(frame.base).toMatchObject({ key: 'FRANCE|DEPART', scale: 'DEPART', title: 'France entière' });
    });

    it('ne se construit jamais d’un fond de communes, ni d’un fond d’une autre maille', () => {
        expect(buildFrame(communes({ base: { ...FRANCE_BY_DEPARTEMENT, scale: 'COMM' } }))).toBeNull();
        expect(buildFrame(communes({ base: FRANCE_BY_REGION }))).toBeNull();
        expect(buildFrame(communes({ base: BRETAGNE_BY_DEPARTEMENT }))).toBeNull();
    });

    it('ne se construit que de données par territoire à la maille de son fond', () => {
        expect(buildFrame(communes({ conso: { ...CONSO_FRANCE_BY_DEPARTEMENT, scale: 'COMM' } }))).toBeNull();
        expect(buildFrame(communes({ conso: CONSO_FRANCE_BY_REGION }))).toBeNull();
    });

    it('attend la colonne de valeurs', () => {
        expect(buildFrame(communes({ values: undefined }))).toBeNull();
    });

    it('refuse la colonne d’une autre carte, d’une autre période, ou sans les hectares d’une carte en hectares', () => {
        expect(buildFrame(communes({ values: COMMUNES_HABITAT_MENAGES }))).toBeNull();
        expect(buildFrame(communes({ values: { ...COMMUNES_CONSO_HA, start_year: 2015 } }))).toBeNull();
        expect(buildFrame(communes({ values: COMMUNES_CONSO_SHARE }))).toBeNull();
    });

    it('refuse la colonne de la période précédente quand la période change', () => {
        const in2024 = { ...BY_COMMUNE, startYear: 2024 };
        const conso = { ...CONSO_FRANCE_BY_DEPARTEMENT, start_year: 2024 };

        expect(buildFrame(communes({ request: in2024, conso }))).toBeNull();
        expect(buildFrame(communes({ request: in2024, conso, values: { ...COMMUNES_CONSO_HA, start_year: 2024 } }))).not.toBeNull();
    });

    it('n’attend pas de période d’une colonne qui n’en dépend pas, mais garde celle des chiffres clés', () => {
        const frame = buildFrame(communes({ indicator: EVOLUTION, values: COMMUNES_CONSO_EVOLUTION }));

        expect(frame).toMatchObject({ key: 'FRANCE|COMM|conso_evolution_between_periods|2011-2024', period: { startYear: 2011, endYear: 2024 } });
        expect(buildFrame(communes({ indicator: EVOLUTION, values: COMMUNES_CONSO_EVOLUTION, conso: { ...CONSO_FRANCE_BY_DEPARTEMENT, start_year: 2015 } }))).toBeNull();
    });

    it('lit l’artificialisation des départements pour une carte OCS GE, sans attendre la consommation', () => {
        const frame = buildFrame(communes({ indicator: indicatorOf('artif_pct'), conso: undefined, artif: ARTIF_FRANCE_BY_DEPARTEMENT, values: COMMUNES_ARTIF_SHARE }));

        expect(frame).toMatchObject({ key: 'FRANCE|COMM|artif_pct', data: { source: 'artif', response: ARTIF_FRANCE_BY_DEPARTEMENT }, period: null });
        expect(buildFrame(communes({ indicator: indicatorOf('artif_pct'), artif: ARTIF_FRANCE_BY_REGION, values: COMMUNES_ARTIF_SHARE }))).toBeNull();
    });

    it('tire ses chiffres clés des départements, comme la vue par département', () => {
        expect(buildFrame(communes()).keyFigures).toEqual(buildFrame(departements()).keyFigures);
        expect(buildFrame(communes({ request: { ...BY_COMMUNE, zone: 'HEXAGONE' } })).keyFigures).toEqual(
            buildFrame(departements({ request: { ...BY_DEPARTEMENT, zone: 'HEXAGONE' } })).keyFigures,
        );
    });

    it('partage le fond de la vue par département : titre, chemin, départements cliquables', () => {
        const frame = buildFrame(communes());

        expect(frame.base).toBe(buildFrame(departements()).base);
        expect(frame.base.clickable).toBe(true);
        expect(frame.chartsLand).toEqual({ land_type: 'NATION', land_id: 'NATION' });
    });

    it('affiche les carreaux sur le fond des départements, sans colonne de valeurs', () => {
        const frame = buildFrame(communes({ indicator: GRID, values: undefined }));
        const byDepartement = buildFrame(departements({ indicator: GRID }));

        expect(frame).toMatchObject({ key: 'FRANCE|COMM|conso_ha_gridded|2011-2024', communes: null, render: { renderer: 'grid', mode: 'grid', cells: { file: 'carroyage_national.pmtiles' } } });
        expect(frame.render).toMatchObject({ features: FRANCE_BY_DEPARTEMENT.geojson.features });
        expect(frame.legend).toEqual(byDepartement.legend);
        expect(frame.footnote).toBe(byDepartement.footnote);
        // Une colonne restée en mémoire n'entre pas dans le cadre des carreaux
        expect(buildFrame(communes({ indicator: GRID })).communes).toBeNull();
    });

    it('ne lit pas de colonne hors de la vue dense, même si une réponse est restée en mémoire', () => {
        expect(buildFrame(departements({ values: COMMUNES_CONSO_HA })).communes).toBeNull();
    });

    it('nomme l’image exportée et décrit la carte par ce qu’elle dessine : la version relative, par commune', () => {
        const frame = buildFrame(communes());

        expect(frame.exportMeta).toEqual({
            title: "Consommation d'ENAF (en pourcentage de la surface communale)",
            subtitle: 'France entière · par commune · de 2011 à 2024',
            filename: 'carte-france-comm-conso_ha',
            credits: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)',
            unitLabel: '%',
        });
        expect(frame.ariaLabel).toBe(
            "Carte de la France entière par commune, indicateur Consommation d'ENAF (en pourcentage de la surface communale). Les régions d'outre-mer sont placées à gauche de l'Hexagone.",
        );
        expect(buildFrame(communes({ request: { ...BY_COMMUNE, zone: 'HEXAGONE' } })).ariaLabel).toBe(
            "Carte de la zone Hexagone par commune, indicateur Consommation d'ENAF (en pourcentage de la surface communale).",
        );
    });
});

describe('viewErrorOf', () => {
    const ok = { isError: false };
    const failed = { isError: true };
    const allOk = { base: ok, conso: ok, artif: ok, values: ok };

    it('ne signale rien quand les requêtes dont la carte dépend ont abouti', () => {
        expect(viewErrorOf(CONSO, allOk)).toBeNull();
    });

    it('signale d’abord l’échec du fond de carte', () => {
        expect(viewErrorOf(CONSO, { ...allOk, base: failed, conso: failed })).toBe('base-map');
    });

    it('signale l’échec des données que l’indicateur lit, pas celui des autres', () => {
        expect(viewErrorOf(CONSO, { ...allOk, conso: failed })).toBe('data');
        expect(viewErrorOf(CONSO, { ...allOk, artif: failed })).toBeNull();
        expect(viewErrorOf(ARTIF, { ...allOk, conso: failed })).toBeNull();
        expect(viewErrorOf(ARTIF, { ...allOk, artif: failed })).toBe('data');
    });

    it('signale l’échec de la colonne de valeurs par commune', () => {
        expect(viewErrorOf(CONSO, { ...allOk, values: failed })).toBe('data');
        expect(viewErrorOf(ARTIF, { ...allOk, values: failed })).toBe('data');
    });
});

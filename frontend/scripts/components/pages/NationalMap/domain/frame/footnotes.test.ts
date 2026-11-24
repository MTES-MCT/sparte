import { COMMUNES_ARTIF_SHARE, COMMUNES_ARTIF_NET_SHARE, COMMUNES_CONSO_EVOLUTION, COMMUNES_CONSO_HA, COMMUNES_HABITAT_MENAGES } from '../../__fixtures__/communesFixtures';
import { artifFrame, communesFrame, consoFrame } from '../../__fixtures__/frames';
import {
    ARTIF_FRANCE_BY_DEPARTEMENT,
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_MAYOTTE_BY_EPCI,
    FRANCE_BY_DEPARTEMENT,
    FRANCE_BY_REGION,
    MAYOTTE_BY_EPCI,
} from '../../__fixtures__/nationalMapFixtures';
import type { NationalMapBaseMap, NationalMapValues } from '@services/api';
import { missingDataSentence } from './footnotes';

const OFF_MAP =
    'Saint-Pierre-et-Miquelon, Saint-Barthélemy, Saint-Martin, Wallis-et-Futuna, la Polynésie française, ' +
    'la Nouvelle-Calédonie et les Terres australes et antarctiques françaises, qui ne figurent pas sur la carte.';

describe('missingDataSentence', () => {
    it('ne dit rien quand tous les territoires d’une zone ont des données', () => {
        expect(missingDataSentence([], false)).toBeNull();
    });

    it('cite les territoires sans donnée d’une zone', () => {
        expect(missingDataSentence(['Mayotte', 'Guyane'], false)).toBe(
            "Les données de consommation d'espaces ne sont pas disponibles pour Mayotte, Guyane (hachurés sur la carte).",
        );
    });

    it('rappelle toujours, sur la France entière, les collectivités absentes de la carte', () => {
        expect(missingDataSentence([], true)).toBe(`Les données de consommation d'espaces ne sont pas disponibles pour ${OFF_MAP}`);
        expect(missingDataSentence(['Mayotte'], true)).toBe(
            `Les données de consommation d'espaces ne sont pas disponibles pour Mayotte (hachurés sur la carte), ni pour ${OFF_MAP}`,
        );
    });
});

describe('note d’une carte de consommation', () => {
    it('signale sur la France entière le territoire sans donnée et les collectivités absentes', () => {
        expect(consoFrame('FRANCE', FRANCE_BY_REGION, 'conso_pct_surface', CONSO_FRANCE_BY_REGION).footnote).toBe(
            `Les données de consommation d'espaces ne sont pas disponibles pour Mayotte (hachurés sur la carte), ni pour ${OFF_MAP}`,
        );
    });

    it('nomme les territoires sans donnée d’une région, par ordre alphabétique', () => {
        expect(consoFrame('REGION_06', MAYOTTE_BY_EPCI, 'conso_ha', CONSO_MAYOTTE_BY_EPCI).footnote).toBe(
            "Les données de consommation d'espaces ne sont pas disponibles pour CA de Dembeni / Mamoudzou, CC de Petite-Terre (hachurés sur la carte).",
        );
    });

    it('cite par son nom un territoire d’outre-mer entièrement sans donnée, plutôt que la liste de ses territoires', () => {
        // France entière par EPCI : les deux EPCI de Mayotte, dans le cartouche de Mayotte
        const byEpci: NationalMapBaseMap = {
            ...MAYOTTE_BY_EPCI,
            parent: null,
            insets: [{ zone: '06', name: 'Mayotte', bbox: [0, 0, 1, 1], source_bbox: [5_014_000, -1_460_000, 5_042_000, -1_432_000] }],
        };

        expect(consoFrame('FRANCE', byEpci, 'conso_ha', CONSO_MAYOTTE_BY_EPCI).footnote).toBe(
            `Les données de consommation d'espaces ne sont pas disponibles pour Mayotte (hachurés sur la carte), ni pour ${OFF_MAP}`,
        );
    });

    it('ne dit rien d’une région dont tous les territoires ont des données, ni de l’Hexagone', () => {
        expect(consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha', CONSO_BRETAGNE_BY_DEPARTEMENT).footnote).toBeNull();
        expect(consoFrame('HEXAGONE', FRANCE_BY_REGION, 'conso_ha', CONSO_FRANCE_BY_REGION).footnote).toBeNull();
    });
});

describe('note d’une carte carroyée', () => {
    const coverage =
        "Carroyage de 1 km × 1 km de la consommation d'espaces (Cerema, fichiers fonciers), disponible pour l'Hexagone et la Corse. " +
        'Seule la consommation qui a pu être géolocalisée y figure : la somme des carreaux peut différer du total du territoire. ' +
        'Un carreau à cheval sur plusieurs territoires est affiché en entier.';

    it('explique la couverture du carroyage', () => {
        expect(consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha_gridded', CONSO_BRETAGNE_BY_DEPARTEMENT).footnote).toBe(coverage);
    });

    it('ajoute, sur la France entière, l’absence des régions d’outre-mer', () => {
        expect(consoFrame('FRANCE', FRANCE_BY_REGION, 'conso_ha_gridded', CONSO_FRANCE_BY_REGION).footnote).toBe(
            `${coverage} Les régions d'outre-mer, absentes du carroyage, ne figurent pas sur cette vue : elles restent accessibles par le sélecteur de zone.`,
        );
    });
});

describe('note d’une carte OCS GE', () => {
    it('donne, pour les espaces artificialisés, l’étendue des derniers millésimes et le territoire sans donnée', () => {
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct', ARTIF_FRANCE_BY_REGION).footnote).toBe(
            'Source : OCS GE (IGN). Valeurs au millésime n°2 (2020 à 2023). Les années diffèrent selon les départements : ' +
                'les valeurs ne sont pas strictement comparables d’un territoire à l’autre. ' +
                'Donnée non disponible pour Guyane (hachurés) : la couverture OCS GE y est incomplète.',
        );
    });

    it('donne, pour l’artificialisation, les deux millésimes et ce que divise le rythme annuel', () => {
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_net_annual_pct_surface', ARTIF_FRANCE_BY_REGION).footnote).toBe(
            'Source : OCS GE (IGN). Évolution mesurée entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023). ' +
                'Les années diffèrent selon les départements : les valeurs ne sont pas strictement comparables d’un territoire à l’autre. ' +
                'Le rythme annuel divise le flux de chaque département par la durée entre ses deux millésimes. ' +
                'Donnée non disponible pour Guyane (hachurés) : la couverture OCS GE y est incomplète.',
        );
    });
});

describe('note de la carte des sols artificialisés par maille', () => {
    it('donne le millésime des chiffres, dit que l’année de l’image de l’IGN peut différer, et du territoire incomplet que seules ses mailles couvertes sont dessinées', () => {
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_soils', ARTIF_FRANCE_BY_REGION).footnote).toBe(
            'Source : OCS GE (IGN). Chiffres au millésime n°2 (2020 à 2023). Les années diffèrent selon les départements : ' +
                'les valeurs ne sont pas strictement comparables d’un territoire à l’autre. ' +
                'L’image de la carte est celle que publie l’IGN (génération 2021-2023) : son année peut différer de celle des chiffres. ' +
                'Les chiffres clés ne comptent pas Guyane : l’OCS GE ne les couvre pas entièrement, la carte n’en dessine que les mailles couvertes.',
        );
    });

    it('n’ajoute rien quand tous les territoires affichés sont couverts', () => {
        const covered = { ...ARTIF_FRANCE_BY_REGION, lands: Object.fromEntries(Object.entries(ARTIF_FRANCE_BY_REGION.lands).filter(([, land]) => land.artif_ha !== null)) };
        const footnote = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_soils', covered).footnote;

        expect(footnote).toMatch(/^Source : OCS GE \(IGN\)\. Chiffres au millésime n°2 \(2020 à 2023\)\./);
        expect(footnote).toMatch(/\(génération 2021-2023\) : son année peut différer de celle des chiffres\.$/);
        expect(footnote).not.toMatch(/chiffres clés/);
    });
});

describe('note de la carte en anneaux', () => {
    it('donne les deux millésimes du flux, sans parler de cercles ni de rythme annuel : sa légende nomme les deux couleurs', () => {
        const footnote = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', ARTIF_FRANCE_BY_REGION).footnote;

        expect(footnote).toContain('Évolution mesurée entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023).');
        expect(footnote).not.toContain('rythme annuel');
        expect(footnote).toContain('les valeurs ne sont pas strictement comparables d’un territoire à l’autre');
        expect(footnote).toContain('Donnée non disponible pour Guyane (hachurés)');
        expect(footnote).not.toMatch(/cercles/i);
    });
});

describe('note de la carte de toutes les communes d’une zone nationale', () => {
    const RESPONSES = { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT, artif: ARTIF_FRANCE_BY_DEPARTEMENT };
    const footnoteOf = (zone: string, indicatorId: string, column: NationalMapValues): string => communesFrame(zone, indicatorId, column, RESPONSES).footnote;

    it('cite par son nom une région dont aucune commune n’a de donnée, plutôt que ses communes', () => {
        // Dzaoudzi et Mamoudzou sont toutes les communes de Mayotte de la colonne
        expect(footnoteOf('FRANCE', 'conso_ha', COMMUNES_CONSO_HA)).toBe(
            `Les données de consommation d'espaces ne sont pas disponibles pour Île-de-Sein, Mayotte, Suzan (hachurés sur la carte), ni pour ${OFF_MAP}`,
        );
        expect(footnoteOf('FRANCE', 'bivariate_habitat_menages', COMMUNES_HABITAT_MENAGES)).toBe(footnoteOf('FRANCE', 'conso_ha', COMMUNES_CONSO_HA));
    });

    it('ne cite, sur l’Hexagone, que les communes de l’Hexagone', () => {
        expect(footnoteOf('HEXAGONE', 'conso_ha', COMMUNES_CONSO_HA)).toBe(
            "Les données de consommation d'espaces ne sont pas disponibles pour Île-de-Sein, Suzan (hachurés sur la carte).",
        );
    });

    it('compte les communes sans donnée quand la réponse n’a pas pu les nommer toutes', () => {
        const truncated = { ...COMMUNES_CONSO_HA, no_data_count: 120 };

        expect(footnoteOf('FRANCE', 'conso_ha', truncated)).toBe(
            `Les données de consommation d'espaces ne sont pas disponibles pour 120 communes (hachurés sur la carte), ni pour ${OFF_MAP}`,
        );
        expect(footnoteOf('HEXAGONE', 'conso_ha', truncated)).toBe(
            "Les données de consommation d'espaces ne sont pas disponibles pour certaines communes (hachurés sur la carte).",
        );
    });

    describe('communes hachurées alors qu’elles ont des données', () => {
        const MISSING = "Les données de consommation d'espaces ne sont pas disponibles pour Île-de-Sein, Suzan (hachurés sur la carte).";
        // Saint-Brieuc et Lyon ont des données, mais pas d'évolution calculable
        const withoutEvolution = (...ranks: number[]) => ({ ...COMMUNES_CONSO_EVOLUTION, values: COMMUNES_CONSO_EVOLUTION.values.map((value, rank) => (ranks.includes(rank) ? null : value)) });

        it('ne dit rien de plus quand seules les communes sans donnée sont hachurées', () => {
            expect(footnoteOf('HEXAGONE', 'conso_evolution_between_periods', COMMUNES_CONSO_EVOLUTION)).toBe(MISSING);
        });

        it('les compte et dit pourquoi leur évolution manque', () => {
            expect(footnoteOf('HEXAGONE', 'conso_evolution_between_periods', withoutEvolution(1))).toBe(
                `${MISSING} Une autre commune est hachurée : une évolution ne se calcule pas sans consommation sur la première période.`,
            );
            expect(footnoteOf('HEXAGONE', 'conso_evolution_between_periods', withoutEvolution(1, 6))).toBe(
                `${MISSING} 2 autres communes sont hachurées : une évolution ne se calcule pas sans consommation sur la première période.`,
            );
        });

        it('ne compte, sur l’Hexagone, que les communes de l’Hexagone', () => {
            // Ajaccio, hors de l'Hexagone
            expect(footnoteOf('HEXAGONE', 'conso_evolution_between_periods', withoutEvolution(3))).toBe(MISSING);
            expect(footnoteOf('FRANCE', 'conso_evolution_between_periods', withoutEvolution(3))).toContain('Une autre commune est hachurée');
        });

        it('s’appuie sur le décompte de la réponse quand elle n’a pas pu nommer les communes sans donnée, sur la France entière seulement', () => {
            const truncated = { ...withoutEvolution(1, 6), no_data: COMMUNES_CONSO_EVOLUTION.no_data.slice(0, 1), no_data_count: 4 };

            expect(footnoteOf('FRANCE', 'conso_evolution_between_periods', truncated)).toContain('2 autres communes sont hachurées');
            expect(footnoteOf('HEXAGONE', 'conso_evolution_between_periods', truncated)).not.toContain('hachurée');
        });
    });

    it('donne, pour une carte OCS GE, les millésimes des départements de la zone et la région sans donnée', () => {
        expect(footnoteOf('FRANCE', 'artif_pct', COMMUNES_ARTIF_SHARE)).toBe(
            'Source : OCS GE (IGN). Valeurs au millésime n°2 (2020 à 2021). Les années diffèrent selon les départements : ' +
                'les valeurs ne sont pas strictement comparables d’un territoire à l’autre. ' +
                'Donnée non disponible pour Guyane (hachurés) : la couverture OCS GE y est incomplète.',
        );
    });

    it('ne parle pas d’anneaux pour la carte qui en dessine ailleurs, que cette vue dessine en aplat', () => {
        const netHa = { ...COMMUNES_ARTIF_NET_SHARE, amount: 'artif_net_ha', amounts: COMMUNES_ARTIF_NET_SHARE.values };
        const footnote = footnoteOf('HEXAGONE', 'artif_desartif_ha', netHa);

        expect(footnote).toBe(
            'Source : OCS GE (IGN). Évolution mesurée entre le millésime n°1 (2017 à 2018) et le millésime n°2 (2020 à 2021). ' +
                'Les années diffèrent selon les départements : les valeurs ne sont pas strictement comparables d’un territoire à l’autre.',
        );
    });
});

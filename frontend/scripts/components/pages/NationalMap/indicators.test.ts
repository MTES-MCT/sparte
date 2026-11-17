import { ARTIF_INDICATORS } from './artifIndicators';
import { CONSO_INDICATORS, GRID_DESTINATIONS, MAP_INDICATORS, menuLinesOf, renderModeOf, withEndYear } from './indicators';

const byId = (indicators: typeof CONSO_INDICATORS, id: string) => indicators.find((indicator) => indicator.id === id);

describe('withEndYear', () => {
    it('remplace le jeton par l’année qui suit le dernier millésime, dans le libellé et la description', () => {
        const resolved = withEndYear(CONSO_INDICATORS, 2024);

        expect(byId(resolved, 'conso_evolution_between_periods').label).toBe("Évolution de la consommation d'ENAF (en pourcentage) entre 2011-2021 et 2021-2025");
        expect(byId(resolved, 'conso_by_year_and_destination').description).toBe(
            'Nouvelles surfaces urbanisées par destination, année par année, entre le 1er janvier 2011 et le 1er janvier 2025 (diagramme en barres).',
        );
    });

    it('reste générique tant que le dernier millésime n’est pas connu', () => {
        expect(byId(withEndYear(CONSO_INDICATORS), 'conso_evolution_between_periods').label).toBe(
            "Évolution de la consommation d'ENAF (en pourcentage) entre 2011-2021 et 2021-la dernière année disponible",
        );
    });

    it('rend tel quel un indicateur sans jeton, que le millésime soit connu ou non', () => {
        const original = byId(CONSO_INDICATORS, 'conso_ha');

        expect(byId(withEndYear(CONSO_INDICATORS), 'conso_ha')).toBe(original);
        expect(byId(withEndYear(CONSO_INDICATORS, 2024), 'conso_ha')).toBe(original);
    });

    it('ne modifie pas le catalogue', () => {
        withEndYear(CONSO_INDICATORS, 2024);

        expect(byId(CONSO_INDICATORS, 'conso_evolution_between_periods').label).toContain('{{end}}');
    });
});

describe('cartes de la consommation', () => {
    it('ne compte aucune carte à années fixes : la période se règle au sélecteur, pour toutes les cartes en hectares', () => {
        const amounts = MAP_INDICATORS.filter((indicator) => renderModeOf(indicator) === 'symbols');

        expect(amounts.map((indicator) => [indicator.id, indicator.unit, indicator.usesPeriod])).toEqual([
            ['conso_ha', 'ha', true],
            ['conso_habitat_ha', 'ha', true],
            ['conso_activite_ha', 'ha', true],
        ]);
    });
});

describe('cartes carroyées par destination', () => {
    const gridded = MAP_INDICATORS.filter((indicator) => indicator.gridded);
    const byDestination = gridded.filter((indicator) => indicator.destination);

    it('compte une carte pour toutes les destinations, puis une par destination, chacune avec son identifiant', () => {
        expect(gridded.map((indicator) => [indicator.id, indicator.destination ?? null])).toEqual([
            ['conso_ha_gridded', null],
            ['conso_habitat_ha_gridded', 'habitat'],
            ['conso_activite_ha_gridded', 'activite'],
            ['conso_mixte_ha_gridded', 'mixte'],
            ['conso_route_ha_gridded', 'route'],
            ['conso_ferroviaire_ha_gridded', 'ferroviaire'],
            ['conso_inconnu_ha_gridded', 'inconnu'],
        ]);
        expect(byDestination.map((indicator) => indicator.destination)).toEqual(Object.keys(GRID_DESTINATIONS));
    });

    it('leur donne le rendu, l’unité, la précision, la période et les graphiques de la carte de toutes les destinations', () => {
        // Tout ce qu'une carte déclare, hors ce qui la désigne et la range dans le menu
        const profile = ({ id, label, description, destination, menuChoice, ...declared }: (typeof gridded)[number]) => declared;
        const [total] = gridded;

        byDestination.forEach((indicator) => {
            expect(renderModeOf(indicator)).toBe('grid');
            expect(profile(indicator)).toEqual(profile(total));
        });
    });

    it('dit la destination dans le libellé et la description de chaque carte', () => {
        expect(byDestination.map((indicator) => indicator.label)).toEqual([
            "Consommation d'ENAF à destination de l'habitat (en hectares), données carroyées",
            "Consommation d'ENAF à destination de l'activité (en hectares), données carroyées",
            "Consommation d'ENAF à destination mixte (en hectares), données carroyées",
            "Consommation d'ENAF à destination des routes (en hectares), données carroyées",
            "Consommation d'ENAF à destination des voies ferrées (en hectares), données carroyées",
            "Consommation d'ENAF sans destination connue (en hectares), données carroyées",
        ]);
        expect(byDestination[3].description).toBe(
            'Nouvelles surfaces urbanisées à destination des routes, sur la période sélectionnée, en carreaux de 1 km × 1 km (Hexagone et Corse).',
        );
        expect(new Set(gridded.map((indicator) => indicator.description)).size).toBe(7);
    });
});

describe('menuLinesOf', () => {
    const lines = menuLinesOf(MAP_INDICATORS);

    it('range les sept cartes carroyées sur une seule ligne, celle de toutes les destinations, à la place qu’elle avait', () => {
        expect(lines.map((line) => line.head.id)).toEqual([
            'conso_pct_surface',
            'conso_ha_gridded',
            'conso_evolution_between_periods',
            'bivariate_activite_emplois',
            'bivariate_habitat_menages',
            'bivariate_habitat_population',
            'conso_ha',
            'conso_habitat_ha',
            'conso_activite_ha',
        ]);
    });

    it('propose sous cette ligne le choix « Destination », toutes les destinations d’abord', () => {
        const { choices } = lines.find((line) => line.head.id === 'conso_ha_gridded');

        expect(choices.map((choice) => [choice.id, choice.menuChoice.option])).toEqual([
            ['conso_ha_gridded', 'Toutes'],
            ['conso_habitat_ha_gridded', 'Habitat'],
            ['conso_activite_ha_gridded', 'Activité'],
            ['conso_mixte_ha_gridded', 'Mixte'],
            ['conso_route_ha_gridded', 'Routes'],
            ['conso_ferroviaire_ha_gridded', 'Voies ferrées'],
            ['conso_inconnu_ha_gridded', 'Inconnue'],
        ]);
        expect(new Set(choices.map((choice) => choice.menuChoice.title))).toEqual(new Set(['Destination']));
    });

    it('ne propose aucun choix sous la ligne d’une carte seule', () => {
        const single = lines.filter((line) => line.head.id !== 'conso_ha_gridded');

        expect(single.every((line) => line.choices.length === 0)).toBe(true);
        expect(menuLinesOf(ARTIF_INDICATORS).map((line) => [line.head.id, line.choices.length])).toEqual(ARTIF_INDICATORS.map((indicator) => [indicator.id, 0]));
    });

    it('garde les lignes quand les libellés portent l’année du dernier millésime', () => {
        const resolved = menuLinesOf(withEndYear(CONSO_INDICATORS, 2024).filter((indicator) => indicator.type !== 'chart'));

        expect(resolved.map((line) => [line.head.id, line.choices.length])).toEqual(lines.map((line) => [line.head.id, line.choices.length]));
    });
});

import { pressOutcome, tipOf } from './tip';

// Les phrases sont celles que les cartes écrivent aujourd'hui (voir render/points.ts, rings.ts,
// bivariate.ts, grid.ts, soilCells.ts et soilObjects.ts)

describe('tipOf', () => {
    it.each([
        ['un taux sur une période', '0,32 % de 2011 à 2024', '0,32 %', 'de 2011 à 2024'],
        ['un taux sur une seule année', '0,32 % en 2020', '0,32 %', 'en 2020'],
        ['un cumul et sa moyenne annuelle', '2 198 ha de 2011 à 2024, soit 157 ha par an', '2 198 ha', 'de 2011 à 2024, soit 157 ha par an'],
        ['une part et sa surface (commune)', '2,45 %, soit 123 ha de 2011 à 2024', '2,45 %', 'soit 123 ha de 2011 à 2024'],
        ['une valeur et son millésime', '12,3 % au millésime n°2 (2021)', '12,3 %', 'au millésime n°2 (2021)'],
        ['une valeur et son millésime, dans une réponse sans index', '12,3 % au dernier millésime (2021)', '12,3 %', 'au dernier millésime (2021)'],
        ['une valeur et une précision entre parenthèses', '12,3 % (millésime 2021)', '12,3 %', 'millésime 2021'],
        ['une valeur et les années de son millésime', '8 432 ha au millésime n°2 (2019 à 2022)', '8 432 ha', 'au millésime n°2 (2019 à 2022)'],
        ['un flux entre deux millésimes', '+0,4 % entre le millésime n°1 (2018) et le millésime n°2 (2021)', '+0,4 %', 'entre le millésime n°1 (2018) et le millésime n°2 (2021)'],
        ['un flux entre deux millésimes sans index', '+0,4 % entre les deux derniers millésimes (2018 puis 2021)', '+0,4 %', 'entre les deux derniers millésimes (2018 puis 2021)'],
        ['un flux entre deux années', '+0,4 % entre 2018 et 2021', '+0,4 %', 'entre 2018 et 2021'],
        ['une baisse', '−12 ha entre 2018 et 2021', '−12 ha', 'entre 2018 et 2021'],
        ['un carreau', '1,2 ha consommés dans ce carreau de 2011 à 2024', '1,2 ha consommés', 'dans ce carreau de 2011 à 2024'],
        [
            'un bloc de carreaux',
            '0,94 ha consommés par km², en moyenne sur ce bloc de 5 km × 5 km de 2011 à 2024',
            '0,94 ha consommés par km²',
            'en moyenne sur ce bloc de 5 km × 5 km de 2011 à 2024',
        ],
        ['une valeur seule', '45 %', '45 %', ''],
    ])('met en avant la valeur de %s', (_case, valueText, value, context) => {
        expect(tipOf({ name: 'Indre', valueText })).toEqual({ title: 'Indre', swatch: null, measures: [{ label: '', value }], context });
    });

    it('garde les deux taux nommés d’une carte bivariée', () => {
        const valueText = "Consommation annuelle pour l'habitat : 0,015 % par an<br/>Évolution du nombre de ménages : -0,02 % par an";
        expect(tipOf({ name: 'Indre', valueText, swatch: '#5ac8c8' })).toEqual({
            title: 'Indre',
            swatch: '#5ac8c8',
            measures: [
                { label: "Consommation annuelle pour l'habitat", value: '0,015 % par an' },
                { label: 'Évolution du nombre de ménages', value: '-0,02 % par an' },
            ],
            context: '',
        });
    });

    it('donne les deux flux d’un anneau en valeur, et leur solde en contexte', () => {
        const tip = tipOf({ name: 'Nord', valueText: '+1 712 ha artificialisés, −183 ha désartificialisés<br/>soit +1 530 ha nets entre 2018 et 2021' });
        expect(tip.measures).toEqual([{ label: '', value: '+1 712 ha artificialisés, −183 ha désartificialisés' }]);
        expect(tip.context).toBe('soit +1 530 ha nets entre 2018 et 2021');
    });

    it('rattache la maille d’une mesure à son contexte', () => {
        const tip = tipOf({ name: 'Rhône', valueText: 'Maille de 1 km × 1 km : 23 % de sols artificialisés (millésime 2021)' });
        expect(tip.measures).toEqual([{ label: '', value: '23 % de sols artificialisés' }]);
        expect(tip.context).toBe('Maille de 1 km × 1 km, millésime 2021');
    });

    it('fait de la surface d’un objet OCS GE sa valeur, et du reste son contexte', () => {
        const tip = tipOf({ name: 'Sol artificialisé', valueText: 'Couverture : zones bâties · usage : résidentiel · 1 240 m² · millésime 2020', swatch: '#ff9b93' });
        expect(tip).toEqual({
            title: 'Sol artificialisé',
            swatch: '#ff9b93',
            measures: [{ label: '', value: '1 240 m²' }],
            context: 'Couverture : zones bâties · usage : résidentiel · millésime 2020',
        });
    });

    it('laisse sans valeur un objet OCS GE dont la surface est inconnue', () => {
        const tip = tipOf({ name: 'Sol artificialisé', valueText: 'Couverture : inconnue · usage : inconnu' });
        expect(tip.measures).toEqual([]);
        expect(tip.context).toBe('Couverture : inconnue · usage : inconnu');
    });

    it.each([
        ['Donnée non disponible'],
        ['Pas de donnée OCS GE à cet endroit'],
        ['Pas de consommation localisée dans ce carreau de 2011 à 2024'],
        ['Aucune surface artificialisée ni désartificialisée entre 2018 et 2021'],
        ['Maille de 1 km × 1 km : part artificialisée inconnue'],
    ])('ne met rien en avant et ne tronque rien pour « %s »', (valueText) => {
        expect(tipOf({ name: 'Mayotte', valueText })).toEqual({ title: 'Mayotte', swatch: null, measures: [], context: valueText });
    });

    it('se réduit au nom quand la carte ne dit rien de l’élément', () => {
        expect(tipOf({ name: 'Loir-et-Cher', valueText: '' })).toEqual({ title: 'Loir-et-Cher', swatch: null, measures: [], context: '' });
    });
});

describe('pressOutcome', () => {
    it('lit toujours au doigt, que le territoire puisse être ouvert ou non', () => {
        expect(pressOutcome(true, true)).toBe('read');
        expect(pressOutcome(true, false)).toBe('read');
    });

    it('ouvre à la souris un territoire qui peut l’être, et ne fait rien sinon', () => {
        expect(pressOutcome(false, true)).toBe('open');
        expect(pressOutcome(false, false)).toBe('none');
    });
});

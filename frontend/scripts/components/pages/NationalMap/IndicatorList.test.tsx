import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { DESTINATION_COLORS } from './domain/grid/consoColors';
import { indicatorOf } from './__fixtures__/frames';
import { ARTIF_FLUX_INDICATORS } from './artifIndicators';
import IndicatorList from './IndicatorList';
import { CONSO_INDICATORS } from './indicators';

// jsdom n'implémente pas le défilement : les lignes amenées dans la fenêtre du menu sont consignées
const scrolled: Element[] = [];
beforeAll(() => {
    Element.prototype.scrollIntoView = function scrollIntoView(this: Element) {
        scrolled.push(this);
    };
});
beforeEach(() => {
    scrolled.length = 0;
});

const BY_EPCI = { zone: 'FRANCE', scale: 'EPCI' };
const BY_COMMUNE = { zone: 'FRANCE', scale: 'COMM' };

const list = (selected: string, view = BY_EPCI, indicators = CONSO_INDICATORS) => (
    <IndicatorList
        name="conso"
        indicators={indicators}
        selected={selected}
        view={view}
        onLineChange={jest.fn()}
        onChange={jest.fn()}
        activeCharts={[]}
        onToggleChart={jest.fn()}
    />
);
const lineOf = (id: string): HTMLElement => screen.getAllByRole('radio').find((radio) => (radio as HTMLInputElement).value === id).closest('li');

describe('ligne choisie dans le menu', () => {
    it('laisse le menu se lire depuis le haut à l’ouverture', () => {
        render(list('conso_ha'));

        expect(scrolled).toEqual([]);
    });

    it('amène dans la fenêtre du menu la ligne qui vient d’être choisie, avec ce qui s’ouvre sous elle', () => {
        const { rerender } = render(list('conso_pct_surface'));

        rerender(list('conso_ha'));
        expect(scrolled).toEqual([lineOf('conso_ha')]);

        // Une destination du carroyage : la ligne reste celle de sa famille, son choix s'ouvre sous elle
        rerender(list('conso_habitat_ha_gridded'));
        expect(scrolled[1]).toBe(lineOf('conso_habitat_ha_gridded'));
        expect(scrolled[1]).toContainElement(screen.getByRole('group', { name: 'Destination' }));
    });
});

describe('ce que la ligne choisie dit de la carte dessinée', () => {
    const RINGS = 'artif_desartif_ha';
    const RINGS_LABEL = 'Artificialisation et désartificialisation entre les deux derniers millésimes (en hectares)';
    const NET_SHARE_LABEL = 'Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)';
    const textOf = (id: string): string => lineOf(id).textContent;

    it('décrit les anneaux là où la carte les dessine', () => {
        render(list(RINGS, BY_EPCI, ARTIF_FLUX_INDICATORS));

        expect(textOf(RINGS)).toBe(`${RINGS_LABEL}${indicatorOf(RINGS).description}`);
    });

    it('nomme l’aplat de l’artificialisation nette, et non des anneaux en hectares, pour toutes les communes du pays', () => {
        render(list(RINGS, BY_COMMUNE, ARTIF_FLUX_INDICATORS));

        expect(textOf(RINGS)).toBe(
            `${RINGS_LABEL}À cette maille, la carte dessine : ${NET_SHARE_LABEL}` +
                "À l'échelle du pays, des anneaux par commune ne seraient pas lisibles : la carte représente l'artificialisation nette " +
                'rapportée à la surface de chaque commune, et ses hectares sont donnés au survol.',
        );
        // La description des anneaux ne reste pas sous une carte qui n'en dessine pas
        expect(textOf(RINGS)).not.toContain('ses deux arcs');
    });

    it('en fait autant pour une carte en cercles proportionnels', () => {
        render(list('conso_ha', BY_COMMUNE));

        expect(textOf('conso_ha')).toContain("À cette maille, la carte dessine : Consommation d'ENAF (en pourcentage de la surface communale)");
        expect(textOf('conso_ha')).toContain('des cercles proportionnels par commune ne seraient pas lisibles');
        expect(textOf('conso_ha')).not.toContain(indicatorOf('conso_ha').description);
    });

    it('garde sa description à une carte que la vue dessine telle quelle, et aux communes d’une région', () => {
        const { rerender } = render(list('conso_pct_surface', BY_COMMUNE));
        expect(textOf('conso_pct_surface')).toBe(`${indicatorOf('conso_pct_surface').label}${indicatorOf('conso_pct_surface').description}`);

        rerender(list(RINGS, { zone: 'REGION_84', scale: 'COMM' }, ARTIF_FLUX_INDICATORS));
        expect(textOf(RINGS)).toBe(`${RINGS_LABEL}${indicatorOf(RINGS).description}`);
    });
});

describe('choix de la destination du carroyage', () => {
    const buttons = (): HTMLElement[] => within(screen.getByRole('group', { name: 'Destination' })).getAllByRole('button');
    // Pastille d'un bouton : son seul élément masqué aux lecteurs d'écran
    const dotOf = (button: HTMLElement): HTMLElement => button.querySelector('[aria-hidden="true"]');

    it('pose dans chaque bouton une pastille de la couleur de sa carte, sans rien ajouter à son nom', () => {
        render(list('conso_ha_gridded'));

        expect(buttons().map((button) => button.textContent)).toEqual(['Toutes', 'Habitat', 'Activité', 'Mixte', 'Routes', 'Voies ferrées', 'Inconnue']);
        expect(buttons().map((button) => dotOf(button))).not.toContain(null);
        expect(dotOf(buttons()[2])).toHaveStyle({ background: DESTINATION_COLORS.activite });
        expect(dotOf(buttons()[4])).toHaveStyle({ background: DESTINATION_COLORS.route });
    });

    it('donne à « Toutes » la couleur de l’habitat, comme la page Consommation', () => {
        render(list('conso_ha_gridded'));

        expect(dotOf(buttons()[0])).toHaveStyle({ background: DESTINATION_COLORS.total });
        expect(DESTINATION_COLORS.total).toBe(DESTINATION_COLORS.habitat);
    });
});

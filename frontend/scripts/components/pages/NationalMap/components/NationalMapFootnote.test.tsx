import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import NationalMapFootnote from './NationalMapFootnote';
import { resizeObserverStub } from '../__fixtures__/resizeObserverStub';

const SHORT = 'Source : OCS GE (IGN).';
const LONG = "Les données de consommation d'espaces ne sont pas disponibles pour Mayotte (hachurés sur la carte), ni pour Saint-Pierre-et-Miquelon.";
const OTHER_LONG = "Carroyage de 1 km × 1 km de la consommation d'espaces (Cerema, fichiers fonciers), disponible pour l'Hexagone et la Corse.";

// jsdom ne calcule aucune mise en page : le paragraphe rend les hauteurs que le test lui donne.
// Trois lignes de 18 px sont visibles ; `fullHeight` est la hauteur du texte entier.
const layOutTextAs = (fullHeight: number): void => {
    jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(54);
    jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(fullHeight);
};

const toggle = (): HTMLElement | null => screen.queryByRole('button');
const isClamped = (text: string): boolean => getComputedStyle(screen.getByText(text)).overflow === 'hidden';

afterEach(() => jest.restoreAllMocks());

describe('note de la carte', () => {
    it('affiche une note courte en entier, sans bouton', () => {
        layOutTextAs(36);
        render(<NationalMapFootnote text={SHORT} />);

        expect(screen.getByText(SHORT)).toBeInTheDocument();
        expect(toggle()).toBeNull();
    });

    it('n’offre pas de déplier une note de trois lignes exactement', () => {
        layOutTextAs(54);
        render(<NationalMapFootnote text={LONG} />);

        expect(toggle()).toBeNull();
    });

    it('replie une note de plus de trois lignes, dont le texte entier reste dans le document', () => {
        layOutTextAs(90);
        render(<NationalMapFootnote text={LONG} />);

        expect(isClamped(LONG)).toBe(true);
        expect(toggle()).toHaveTextContent('Lire la suite');
        expect(toggle()).toHaveAttribute('aria-expanded', 'false');
        expect(toggle()).toHaveAttribute('aria-controls', screen.getByText(LONG).id);
    });

    it('déplie la note au clic, puis la replie', () => {
        layOutTextAs(90);
        render(<NationalMapFootnote text={LONG} />);
        fireEvent.click(toggle());

        expect(isClamped(LONG)).toBe(false);
        expect(toggle()).toHaveTextContent('Réduire la note');
        expect(toggle()).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(toggle());

        expect(isClamped(LONG)).toBe(true);
        expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    });

    it('replie la note d’une autre carte, même si la précédente était dépliée', () => {
        layOutTextAs(90);
        const { rerender } = render(<NationalMapFootnote text={LONG} />);
        fireEvent.click(toggle());
        rerender(<NationalMapFootnote text={OTHER_LONG} />);

        expect(isClamped(OTHER_LONG)).toBe(true);
        expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    });

    it('garde la note dépliée quand la carte suivante porte la même note', () => {
        layOutTextAs(90);
        const { rerender } = render(<NationalMapFootnote text={LONG} />);
        fireEvent.click(toggle());
        rerender(<NationalMapFootnote text={LONG} />);

        expect(isClamped(LONG)).toBe(false);
    });

    it('retire le bouton quand la note suivante tient en trois lignes', () => {
        layOutTextAs(90);
        const { rerender } = render(<NationalMapFootnote text={LONG} />);
        layOutTextAs(36);
        rerender(<NationalMapFootnote text={SHORT} />);

        expect(toggle()).toBeNull();
    });

    describe('quand la colonne change de largeur', () => {
        beforeEach(resizeObserverStub.install);

        afterEach(resizeObserverStub.remove);

        it('offre de déplier la note que la colonne, rétrécie, coupe désormais', () => {
            layOutTextAs(54);
            render(<NationalMapFootnote text={LONG} />);
            layOutTextAs(72);
            act(() => resizeObserverStub.resize(300, 54));

            expect(toggle()).toHaveTextContent('Lire la suite');
        });

        it('cesse d’observer la note quand elle est retirée', () => {
            layOutTextAs(54);
            const { unmount } = render(<NationalMapFootnote text={LONG} />);
            unmount();

            expect(resizeObserverStub.observers.map(({ disconnected }) => disconnected)).toEqual([true]);
        });
    });
});

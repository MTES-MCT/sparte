import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import RouteWrapper from './RouteWrapper';

/**
 * RouteWrapper lit l'URL courante (useLocation) pour remonter en haut de page
 * à chaque changement de route et met à jour le titre du document.
 */
describe('RouteWrapper', () => {
    let scrollTo: jest.Mock;

    beforeEach(() => {
        // jsdom n'implémente pas window.scrollTo
        scrollTo = jest.fn();
        Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
    });

    it('renders the title, the children and sets the document title', () => {
        render(
            <MemoryRouter>
                <RouteWrapper title="Consommation d'espaces" showFeedback={false}>
                    <p>Contenu de la page</p>
                </RouteWrapper>
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { level: 1, name: "Consommation d'espaces" })).toBeInTheDocument();
        expect(screen.getByText('Contenu de la page')).toBeInTheDocument();
        expect(document.title).toBe("Consommation d'espaces | Mon Diagnostic Artificialisation");
    });

    it('hides the title and the page when asked', () => {
        render(
            <MemoryRouter>
                <RouteWrapper title="Synthèse" showTitle={false} showPage={false} showFeedback={false}>
                    <p>Contenu masqué</p>
                </RouteWrapper>
            </MemoryRouter>,
        );

        expect(screen.queryByRole('heading')).toBeNull();
        expect(screen.queryByText('Contenu masqué')).toBeNull();
    });

    it('scrolls to the top each time the route changes', async () => {
        render(
            <MemoryRouter initialEntries={['/synthese']}>
                <Routes>
                    <Route
                        path="/synthese"
                        element={
                            <RouteWrapper title="Synthèse" showFeedback={false}>
                                <Link to="/consommation">Voir la consommation</Link>
                            </RouteWrapper>
                        }
                    />
                    <Route
                        path="/consommation"
                        element={
                            <RouteWrapper title="Consommation" showFeedback={false}>
                                <p>Consommation</p>
                            </RouteWrapper>
                        }
                    />
                </Routes>
            </MemoryRouter>,
        );
        expect(scrollTo).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByRole('link', { name: 'Voir la consommation' }));

        expect(screen.getByRole('heading', { level: 1, name: 'Consommation' })).toBeInTheDocument();
        expect(scrollTo).toHaveBeenCalledTimes(2);
        expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'instant' });
        expect(document.title).toBe('Consommation | Mon Diagnostic Artificialisation');
    });
});

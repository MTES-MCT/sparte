import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import useMatomoTracking from './useMatomoTracking';

const Tracked: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useMatomoTracking();
    return <>{children}</>;
};

const renderAt = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Tracked>
                <Routes>
                    <Route path="/synthese" element={<Link to="/consommation">Consommation</Link>} />
                    <Route path="/consommation" element={<p>Page consommation</p>} />
                </Routes>
            </Tracked>
        </MemoryRouter>,
    );

/**
 * Le hook lit l'URL courante (useLocation) et pousse une vue de page à Matomo à chaque changement.
 */
describe('useMatomoTracking', () => {
    let meta: HTMLMetaElement;

    beforeEach(() => {
        globalThis._paq = [];
        meta = document.createElement('meta');
        meta.name = 'matomo-enabled';
        document.head.appendChild(meta);
    });

    afterEach(() => {
        meta.remove();
    });

    it('does nothing when Matomo is disabled', () => {
        meta.content = 'false';
        renderAt('/synthese');

        expect(_paq).toEqual([]);
    });

    it('tracks the initial page and each route change', async () => {
        meta.content = 'true';
        renderAt('/synthese');

        expect(_paq).toEqual([['setCustomUrl', '/synthese'], ['setDocumentTitle', document.title], ['trackPageView']]);

        await userEvent.click(screen.getByRole('link', { name: 'Consommation' }));

        expect(screen.getByText('Page consommation')).toBeInTheDocument();
        expect(_paq.slice(3)).toEqual([
            ['setCustomUrl', '/consommation'],
            ['setDocumentTitle', document.title],
            ['trackPageView'],
        ]);
    });
});

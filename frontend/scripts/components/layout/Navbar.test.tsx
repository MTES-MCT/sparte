import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import store from '@store/store';
import { LandDetailResultType } from '@services/types/land';
import Navbar from './Navbar';

const navbar = {
    menuItems: [
        { label: 'Synthèse', url: '/epci/200000172', icon: 'bi-house' },
        {
            label: 'Indicateurs',
            subMenu: [
                { label: 'Consommation', url: '/epci/200000172/consommation' },
                { label: 'Friches', soon: true },
            ],
        },
    ],
};
const urls = { downloads: '/epci/200000172/telechargements' };

const renderNavbar = (path: string, hasConso = true) =>
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <Navbar navbar={navbar} urls={urls} landData={{ has_conso: hasConso } as LandDetailResultType} />
            </MemoryRouter>
        </Provider>,
    );

/**
 * La Navbar construit ses entrées avec <Link> et repère la page courante via useLocation.
 */
describe('Navbar', () => {
    it('renders menu entries as links to their routes', () => {
        renderNavbar('/epci/200000172');

        expect(screen.getByRole('link', { name: 'Synthèse' })).toHaveAttribute('href', '/epci/200000172');
        expect(screen.getByRole('link', { name: 'Consommation' })).toHaveAttribute('href', '/epci/200000172/consommation');
        expect(screen.getByRole('link', { name: 'Générer un rapport' })).toHaveAttribute('href', '/epci/200000172/telechargements');
    });

    it('does not link entries without url', () => {
        renderNavbar('/epci/200000172');

        expect(screen.queryByRole('link', { name: /Friches/ })).toBeNull();
        expect(screen.getByText('Friches')).toBeInTheDocument();
        expect(screen.getByText('Bientôt')).toBeInTheDocument();
    });

    it('highlights the entry matching the current location', () => {
        renderNavbar('/epci/200000172/consommation');

        expect(screen.getByRole('link', { name: 'Consommation' })).toHaveStyle({ borderColor: '#6a6af4' });
        expect(screen.getByRole('link', { name: 'Synthèse' })).toHaveStyle({ borderColor: 'transparent' });
    });

    it('hides the report download button when the land has no consumption data', () => {
        renderNavbar('/epci/200000172', false);

        expect(screen.queryByRole('link', { name: 'Générer un rapport' })).toBeNull();
    });
});

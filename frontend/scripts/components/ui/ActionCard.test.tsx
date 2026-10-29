import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ActionCard from './ActionCard';

describe('ActionCard', () => {
    it('renders a link card when `to` is given', () => {
        render(
            <MemoryRouter>
                <ActionCard title="Rapport complet" description="Toutes les données" to="/telechargements/complet" />
            </MemoryRouter>,
        );

        const link = screen.getByRole('link', { name: /Rapport complet/ });
        expect(link).toHaveAttribute('href', '/telechargements/complet');
        expect(link).toHaveTextContent('Toutes les données');
    });

    it('does not render a link when the card is disabled', () => {
        render(
            <MemoryRouter>
                <ActionCard title="Rapport complet" description="Bientôt disponible" to="/telechargements/complet" disabled />
            </MemoryRouter>,
        );

        expect(screen.queryByRole('link')).toBeNull();
        expect(screen.getByText('Rapport complet')).toBeInTheDocument();
    });

    it('navigates to the target route when clicked', async () => {
        render(
            <MemoryRouter initialEntries={['/telechargements']}>
                <Routes>
                    <Route
                        path="/telechargements"
                        element={<ActionCard title="Rapport complet" description="Toutes les données" to="/telechargements/complet" />}
                    />
                    <Route path="/telechargements/complet" element={<h1>Rapport complet : paramètres</h1>} />
                </Routes>
            </MemoryRouter>,
        );

        await userEvent.click(screen.getByRole('link', { name: /Rapport complet/ }));

        expect(screen.getByRole('heading', { name: 'Rapport complet : paramètres' })).toBeInTheDocument();
    });
});

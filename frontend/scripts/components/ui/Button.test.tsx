import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Button from './Button';

/**
 * Button s'appuie sur <Link> de react-router-dom quand il reçoit `to` :
 * on vérifie le rendu et la navigation réelle, sans doubler le routeur.
 */
describe('Button', () => {
    it('renders a native button when no `to` is given', () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick}>Valider</Button>);

        const button = screen.getByRole('button', { name: 'Valider' });
        expect(button.tagName).toBe('BUTTON');
        button.click();
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders a link to the given route when `to` is given', () => {
        render(
            <MemoryRouter>
                <Button to="/territoire/consommation" icon="bi bi-download" iconPosition="right">
                    Télécharger
                </Button>
            </MemoryRouter>,
        );

        const link = screen.getByRole('link', { name: 'Télécharger' });
        expect(link).toHaveAttribute('href', '/territoire/consommation');
        expect(link.querySelector('i.bi-download')).not.toBeNull();
    });

    it('navigates to the target route when the link is clicked', async () => {
        render(
            <MemoryRouter initialEntries={['/accueil']}>
                <Routes>
                    <Route path="/accueil" element={<Button to="/cible">Aller à la cible</Button>} />
                    <Route path="/cible" element={<h1>Page cible</h1>} />
                </Routes>
            </MemoryRouter>,
        );

        await userEvent.click(screen.getByRole('link', { name: 'Aller à la cible' }));

        expect(screen.getByRole('heading', { name: 'Page cible' })).toBeInTheDocument();
        expect(screen.queryByRole('link')).toBeNull();
    });
});

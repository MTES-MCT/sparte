import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { OcsgeDrawerProvider } from '@components/features/ocsge/OcsgeDrawerContext';
import type { Millesime } from '@services/types/land';
import MillesimeBadge from './MillesimeBadge';
import NationalMapFootnote from './NationalMapFootnote';
import { landsMillesimeReading, millesimeExplanation } from '../domain/millesimes';

const RHONE: Millesime[] = [
    { departement: '69', departement_name: 'Rhône', index: 1, year: 2017 },
    { departement: '69', departement_name: 'Rhône', index: 2, year: 2020 },
];
const LAND = { artif_years: [2020], artif_index: 2, artif_net_years_old: [2017], artif_net_years_new: [2020], artif_net_index_old: 1, artif_net_index_new: 2 };
const STOCK = landsMillesimeReading([LAND], 'stock');
const FLUX = landsMillesimeReading([LAND], 'flux');

// Le tiroir des diagnostics est toujours dans le document : ouvert, il bloque le défilement de la page
const drawerIsOpen = (): boolean => document.body.style.overflow === 'hidden';

const withDrawer = (children: React.ReactNode, extraSections = millesimeExplanation({ kind: 'stock', reading: STOCK, zoneName: 'Rhône', zoneMillesimes: RHONE })) =>
    render(
        <OcsgeDrawerProvider millesimes={RHONE} territoryName="Rhône" isInterdepartemental extraSections={extraSections}>
            {children}
        </OcsgeDrawerProvider>,
    );

describe('millésimes à la place du sélecteur de période', () => {
    it('désigne le millésime par son index, ses années à côté, et ouvre l’explication', () => {
        withDrawer(<MillesimeBadge layout="bar" reading={STOCK} />);
        const badge = screen.getByRole('button', { name: 'Millésime n°2 (2020). Qu’est-ce qu’un millésime ?' });

        expect(badge).toHaveTextContent('Millésime n°22020');
        expect(badge).toHaveAttribute('title', 'Qu’est-ce qu’un millésime ?');
        expect(drawerIsOpen()).toBe(false);

        fireEvent.click(badge);

        expect(drawerIsOpen()).toBe(true);
    });

    it('donne les deux millésimes d’un flux', () => {
        withDrawer(<MillesimeBadge layout="bar" reading={FLUX} />);

        expect(screen.getByRole('button', { name: 'Millésimes n°1 (2017) et n°2 (2020). Qu’est-ce qu’un millésime ?' })).toHaveTextContent('Millésimes n°1 et n°22017 puis 2020');
    });

    it('écrit le renvoi en toutes lettres quand les commandes sont empilées (téléphone)', () => {
        withDrawer(<MillesimeBadge layout="stack" reading={STOCK} />);

        fireEvent.click(screen.getByRole('button', { name: 'Qu’est-ce qu’un millésime ?' }));

        expect(drawerIsOpen()).toBe(true);
    });

    it('reste lisible tant que la carte n’a pas de millésime à annoncer', () => {
        withDrawer(<MillesimeBadge layout="bar" reading={null} />);

        expect(screen.getByRole('button', { name: 'Millésimes de l’OCS GE. Qu’est-ce qu’un millésime ?' })).toHaveTextContent('Millésimes de l’OCS GE');
    });
});

describe('renvoi de la note de la carte', () => {
    it('ouvre l’explication depuis la note d’une carte de l’OCS GE', () => {
        withDrawer(<NationalMapFootnote text="Source : OCS GE (IGN). Valeurs au millésime n°2 (2020)." explainsMillesimes />);

        fireEvent.click(screen.getByRole('button', { name: 'Qu’est-ce qu’un millésime ?' }));

        expect(drawerIsOpen()).toBe(true);
    });

    it('n’est proposé ni pour une autre note, ni hors de la page de la carte', () => {
        const { unmount } = withDrawer(<NationalMapFootnote text="Carroyage de 1 km × 1 km." />);
        expect(screen.queryByRole('button', { name: 'Qu’est-ce qu’un millésime ?' })).toBeNull();
        unmount();

        render(<NationalMapFootnote text="Source : OCS GE (IGN)." explainsMillesimes />);
        expect(screen.queryByRole('button', { name: 'Qu’est-ce qu’un millésime ?' })).toBeNull();
    });
});

describe('explication : le tiroir des diagnostics, complété', () => {
    it('place les sections de la carte entre la source des données et le tableau par index', () => {
        withDrawer(<MillesimeBadge layout="bar" reading={STOCK} />);

        expect(screen.getAllByRole('heading', { level: 4 }).map((heading) => heading.textContent)).toEqual([
            'Comprendre les données OCS GE',
            'Source des données',
            'Pourquoi un numéro plutôt qu’une année ?',
            'Ce que montre cette carte',
            'Millésimes disponibles',
        ]);
        expect(screen.getByText('Sur cette carte, chaque territoire affiché est représenté au millésime n°2 (2020).')).toBeInTheDocument();
        // Tableau par index, même pour un seul département : « n°1 — 2017 », « n°2 — 2020 »
        expect(screen.getByText('n°1')).toBeInTheDocument();
        expect(screen.getByText('n°2')).toBeInTheDocument();
        expect(screen.getAllByText(/Rhône \(69\)/)).toHaveLength(2);
    });

    it('retire sur demande l’ombre du tiroir fermé, que les diagnostics gardent', () => {
        const drawerOf = (flushWhenClosed?: boolean): HTMLElement => {
            const { container } = render(
                <OcsgeDrawerProvider millesimes={RHONE} territoryName="Rhône" isInterdepartemental flushWhenClosed={flushWhenClosed}>
                    <MillesimeBadge layout="bar" reading={STOCK} />
                </OcsgeDrawerProvider>,
            );
            return within(container).getByText('Comprendre les données OCS GE').parentElement as HTMLElement;
        };
        const kept = drawerOf();
        const flushed = drawerOf(true);

        expect(getComputedStyle(kept).boxShadow).not.toBe('none');
        expect(getComputedStyle(flushed).boxShadow).toBe('none');

        // Ouvert, le tiroir retrouve son ombre
        fireEvent.click(within(flushed.parentElement as HTMLElement).getByRole('button', { name: /Millésime n°2/ }));
        expect(getComputedStyle(flushed).boxShadow).not.toBe('none');
    });

    it('ne change rien au tiroir des diagnostics, qui ne lui donne aucune section', () => {
        render(
            <OcsgeDrawerProvider millesimes={RHONE} territoryName="Rhône" isInterdepartemental={false}>
                <span>page</span>
            </OcsgeDrawerProvider>,
        );

        expect(screen.getAllByRole('heading', { level: 4 }).map((heading) => heading.textContent)).toEqual(['Comprendre les données OCS GE', 'Source des données', 'Millésimes disponibles']);
    });
});

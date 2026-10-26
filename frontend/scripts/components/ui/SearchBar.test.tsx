import React from 'react';
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchTerritoryQuery } from '@services/api';
import { LandDetailResultType, LandType } from '@services/types/land';
import SearchBar from './SearchBar';

jest.mock('@services/api', () => ({
    useSearchTerritoryQuery: jest.fn(),
}));

const mockedSearchQuery = useSearchTerritoryQuery as jest.Mock;

const makeTerritory = (overrides: Partial<LandDetailResultType>): LandDetailResultType => ({
    land_id: '69123',
    land_type: LandType.COMMUNE,
    land_type_slug: 'commune',
    land_type_label: 'Commune',
    name: 'Lyon',
    slug: 'lyon',
    surface: 4787,
    ...overrides,
} as LandDetailResultType);

const lyon = makeTerritory({});
const lys = makeTerritory({ land_id: '59368', name: 'Lys-lez-Lannoy', slug: 'lys-lez-lannoy' });
// Références stables entre rendus, comme les données de RTK Query (sinon l'effet du composant boucle)
const noResult: LandDetailResultType[] = [];
const resultsByNeedle: Record<string, LandDetailResultType[]> = {
    ly: [lyon, lys],
};

const DEBOUNCE_DELAY = 200;
const BLUR_RESET_DELAY = 150;

const setup = (ui: React.ReactElement = <SearchBar onTerritorySelect={jest.fn()} />) => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(ui);
    return { user, input: screen.getByRole('combobox', { name: 'Rechercher un territoire' }) };
};

const advanceTimers = (delay: number) => {
    act(() => {
        jest.advanceTimersByTime(delay);
    });
};

describe('SearchBar : navigation clavier et accessibilité', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockedSearchQuery.mockReset();
        mockedSearchQuery.mockImplementation((needle: string, options: { skip: boolean }) => ({
            data: options.skip ? undefined : resultsByNeedle[needle] ?? noResult,
            isFetching: false,
        }));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('est atteignable avec Tab et expose un combobox fermé', async () => {
        const { user, input } = setup();

        await user.tab();

        expect(input).toHaveFocus();
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-activedescendant');
    });

    it('attend la fin du debounce et au moins 2 caractères avant de chercher', async () => {
        const { user, input } = setup();

        await user.type(input, 'l');
        advanceTimers(DEBOUNCE_DELAY);
        expect(mockedSearchQuery).toHaveBeenLastCalledWith('l', { skip: true });
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

        await user.type(input, 'y');
        expect(mockedSearchQuery).not.toHaveBeenCalledWith('ly', expect.anything());
        advanceTimers(DEBOUNCE_DELAY);
        expect(mockedSearchQuery).toHaveBeenLastCalledWith('ly', { skip: false });
        expect(screen.getAllByRole('option')).toHaveLength(2);
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
    });

    it('parcourt les résultats avec les flèches et sélectionne le résultat actif avec Entrée', async () => {
        const onTerritorySelect = jest.fn();
        const { user, input } = setup(<SearchBar onTerritorySelect={onTerritorySelect} />);
        await user.type(input, 'ly');
        advanceTimers(DEBOUNCE_DELAY);
        const options = screen.getAllByRole('option');
        expect(input).not.toHaveAttribute('aria-activedescendant');

        await user.keyboard('{ArrowDown}');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        expect(input).toHaveAttribute('aria-activedescendant', options[0].id);

        await user.keyboard('{ArrowDown}');
        expect(options[1]).toHaveAttribute('aria-selected', 'true');
        expect(options[0]).toHaveAttribute('aria-selected', 'false');
        expect(input).toHaveAttribute('aria-activedescendant', options[1].id);

        // Les flèches bouclent en bout de liste
        await user.keyboard('{ArrowDown}');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        await user.keyboard('{ArrowUp}');
        expect(options[1]).toHaveAttribute('aria-selected', 'true');

        await user.keyboard('{Enter}');
        expect(onTerritorySelect).toHaveBeenCalledTimes(1);
        expect(onTerritorySelect).toHaveBeenCalledWith(lys);
        expect(input).toHaveValue('');
        expect(input).toHaveFocus();
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('Entrée sans résultat actif ne sélectionne rien', async () => {
        const onTerritorySelect = jest.fn();
        const { user, input } = setup(<SearchBar onTerritorySelect={onTerritorySelect} />);
        await user.type(input, 'ly');
        advanceTimers(DEBOUNCE_DELAY);

        await user.keyboard('{Enter}');

        expect(onTerritorySelect).not.toHaveBeenCalled();
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('Échap referme la liste sans vider la saisie, puis vide la saisie', async () => {
        const { user, input } = setup();
        await user.type(input, 'ly');
        advanceTimers(DEBOUNCE_DELAY);
        expect(screen.getByRole('listbox')).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).toHaveValue('ly');
        expect(input).toHaveFocus();

        // La flèche bas rouvre la liste sur le premier résultat
        await user.keyboard('{ArrowDown}');
        expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

        await user.keyboard('{Escape}{Escape}');
        expect(input).toHaveValue('');
    });

    it('les résultats restent cliquables à la souris', async () => {
        const onTerritorySelect = jest.fn();
        const { user, input } = setup(<SearchBar onTerritorySelect={onTerritorySelect} />);
        await user.type(input, 'ly');
        advanceTimers(DEBOUNCE_DELAY);

        await user.click(screen.getByRole('option', { name: /Lyon/ }));

        expect(onTerritorySelect).toHaveBeenCalledWith(lyon);
    });

    it('signale l\'absence de résultat', async () => {
        const { user, input } = setup();

        await user.type(input, 'zz');
        advanceTimers(DEBOUNCE_DELAY);

        expect(screen.getByRole('status')).toHaveTextContent('Aucun résultat trouvé pour votre recherche.');
        expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('sortir du champ avec Tab referme la liste et vide la saisie', async () => {
        const { user, input } = setup(
            <>
                <SearchBar onTerritorySelect={jest.fn()} />
                <button type="button">Suivant</button>
            </>
        );
        await user.type(input, 'ly');
        advanceTimers(DEBOUNCE_DELAY);

        await user.tab();
        expect(screen.getByRole('button', { name: 'Suivant' })).toHaveFocus();
        advanceTimers(BLUR_RESET_DELAY);

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(input).toHaveValue('');
    });

    it('associe le libellé au champ et accepte un id stable', () => {
        render(<SearchBar label="Ajouter un territoire" inputId="search-bar-territory" />);

        expect(screen.getByLabelText('Ajouter un territoire')).toHaveAttribute('id', 'search-bar-territory');
    });

    it('génère des ids distincts quand plusieurs barres coexistent sur une page', () => {
        render(
            <>
                <SearchBar />
                <SearchBar />
            </>
        );

        const [first, second] = screen.getAllByRole('combobox');
        expect(first.id).not.toBe('');
        expect(first.id).not.toBe(second.id);
    });
});

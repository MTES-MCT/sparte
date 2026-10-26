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
    lyo: [lyon],
};

const DEBOUNCE_DELAY = 200;
const BLUR_RESET_DELAY = 150;
const SCOT_HINT_TEXT = /Vous ne trouvez pas votre SCoT/;
const GPU_URL = 'https://www.geoportail-urbanisme.gouv.fr/';

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

describe('SearchBar : navigation clavier et accessibilité', () => {
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

describe('SearchBar : message sur l\'ajout des SCoT via le GPU', () => {
    it('n\'affiche rien tant que le champ est vide', () => {
        setup();

        expect(screen.queryByText(SCOT_HINT_TEXT)).not.toBeInTheDocument();
    });

    it('n\'affiche pas le message pour une recherche de 2 caractères', async () => {
        const { user, input } = setup();

        await user.type(input, 'ly');
        advanceTimers(DEBOUNCE_DELAY);

        expect(screen.getByText('Lyon')).toBeInTheDocument();
        expect(screen.queryByText(SCOT_HINT_TEXT)).not.toBeInTheDocument();
    });

    it('affiche le message avec le lien vers le GPU sous les résultats à partir de 3 caractères', async () => {
        const { user, input } = setup();

        await user.type(input, 'lyo');
        advanceTimers(DEBOUNCE_DELAY);

        const hint = screen.getByText(SCOT_HINT_TEXT);
        expect(hint).toHaveTextContent('il sera ajouté à Mon Diag Artif lors de la prochaine mise à jour des données.');
        const link = screen.getByRole('link', { name: 'Géoportail de l’urbanisme' });
        expect(link).toHaveAttribute('href', GPU_URL);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        // Le message vient après le résultat, en bas de la liste
        const result = screen.getByText('Lyon');
        expect(result.compareDocumentPosition(hint)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('affiche le message quand aucun résultat ne correspond', async () => {
        const { user, input } = setup();

        await user.type(input, 'zzz');
        advanceTimers(DEBOUNCE_DELAY);

        expect(screen.getByText('Aucun résultat trouvé pour votre recherche.')).toBeInTheDocument();
        expect(screen.getByText(SCOT_HINT_TEXT)).toBeInTheDocument();
    });

    it('le lien reste accessible au clavier sans refermer la liste', async () => {
        const { user, input } = setup(
            <>
                <SearchBar onTerritorySelect={jest.fn()} />
                <button type="button">Suivant</button>
            </>
        );
        await user.type(input, 'lyo');
        advanceTimers(DEBOUNCE_DELAY);

        await user.tab();
        expect(screen.getByRole('link', { name: 'Géoportail de l’urbanisme' })).toHaveFocus();
        advanceTimers(BLUR_RESET_DELAY);
        expect(screen.getByText(SCOT_HINT_TEXT)).toBeInTheDocument();
        expect(input).toHaveValue('lyo');

        // En sortant de la barre, la liste se referme et la saisie est vidée comme avant
        await user.tab();
        expect(screen.getByRole('button', { name: 'Suivant' })).toHaveFocus();
        advanceTimers(BLUR_RESET_DELAY);
        expect(screen.queryByText(SCOT_HINT_TEXT)).not.toBeInTheDocument();
        expect(input).toHaveValue('');
    });
});

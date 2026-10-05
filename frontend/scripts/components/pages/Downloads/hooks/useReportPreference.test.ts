import { renderHook } from '@testing-library/react';
import { useGetUserLandPreferenceQuery } from '@services/api';
import { useReportPreference } from './useReportPreference';

jest.mock('@services/api', () => ({
    useGetUserLandPreferenceQuery: jest.fn(),
}));

const mockedQuery = useGetUserLandPreferenceQuery as jest.Mock;

const currentUserPreference = {
    is_favorited: true,
    target_2031: 40,
    comparison_lands: [{ land_type: 'COMM', land_id: '11111', name: 'Courant' }],
    is_main: false,
};

const ownerPreference = {
    target_2031: 30,
    comparison_lands: [{ land_type: 'COMM', land_id: '67890', name: 'Voisine' }],
};

describe('useReportPreference', () => {
    beforeEach(() => {
        mockedQuery.mockReset();
    });

    it("utilise les préférences de l'utilisateur courant sans ownerPreference (éditeur)", () => {
        mockedQuery.mockReturnValue({ data: currentUserPreference });

        const { result } = renderHook(() => useReportPreference('COMM', '12345'));

        expect(result.current).toBe(currentUserPreference);
        expect(mockedQuery).toHaveBeenCalledWith(
            { land_type: 'COMM', land_id: '12345' },
            { skip: false }
        );
    });

    it('utilise les préférences du propriétaire et saute la requête (rendu PDF)', () => {
        mockedQuery.mockReturnValue({ data: undefined });

        const { result } = renderHook(() => useReportPreference('COMM', '12345', ownerPreference));

        expect(result.current).toBe(ownerPreference);
        expect(mockedQuery).toHaveBeenCalledWith(
            { land_type: 'COMM', land_id: '12345' },
            { skip: true }
        );
    });

    it("ne retombe pas sur les préférences anonymes vides quand ownerPreference est fournie", () => {
        // Réponse de l'API pour un appel anonyme (Puppeteer)
        mockedQuery.mockReturnValue({
            data: { is_favorited: false, target_2031: null, comparison_lands: [], is_main: false },
        });

        const { result } = renderHook(() => useReportPreference('COMM', '12345', ownerPreference));

        expect(result.current?.target_2031).toBe(30);
        expect(result.current?.comparison_lands).toEqual(ownerPreference.comparison_lands);
    });
});

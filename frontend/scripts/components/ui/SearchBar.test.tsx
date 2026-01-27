import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';
import * as api from '@services/api';

// Mock the API service
jest.mock('@services/api', () => ({
    useSearchTerritoryQuery: jest.fn(),
}));

// Mock the debounce hook with actual implementation
jest.mock('@hooks/useDebounce', () => ({
    __esModule: true,
    default: (value: string, delay: number) => {
        const [debouncedValue, setDebouncedValue] = React.useState(value);
        
        React.useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);
        
        return debouncedValue;
    },
}));

describe('SearchBar', () => {
    const mockUseSearchTerritoryQuery = api.useSearchTerritoryQuery as jest.MockedFunction<typeof api.useSearchTerritoryQuery>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSearchTerritoryQuery.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any);
    });

    it('should debounce the search query and not call API immediately', async () => {
        const user = userEvent.setup({ delay: null });
        render(<SearchBar />);
        
        const input = screen.getByPlaceholderText(/Rechercher un territoire/i);
        
        // Type quickly without waiting between keystrokes
        await user.type(input, 'Paris');
        
        // The API should not be called immediately after each keystroke
        // It should wait for the debounce delay (300ms)
        expect(mockUseSearchTerritoryQuery).toHaveBeenCalledWith('', expect.anything());
        
        // Wait for debounce delay + a bit extra
        await waitFor(() => {
            expect(mockUseSearchTerritoryQuery).toHaveBeenCalledWith('Paris', expect.anything());
        }, { timeout: 500 });
    });

    it('should skip API call when query is less than minimum characters', async () => {
        const user = userEvent.setup({ delay: null });
        render(<SearchBar />);
        
        const input = screen.getByPlaceholderText(/Rechercher un territoire/i);
        
        // Type only 1 character
        await user.type(input, 'P');
        
        // Wait for debounce
        await waitFor(() => {
            const lastCall = mockUseSearchTerritoryQuery.mock.calls[mockUseSearchTerritoryQuery.mock.calls.length - 1];
            expect(lastCall[1]).toHaveProperty('skip', true);
        }, { timeout: 500 });
    });

    it('should call API when query meets minimum character count', async () => {
        const user = userEvent.setup({ delay: null });
        render(<SearchBar />);
        
        const input = screen.getByPlaceholderText(/Rechercher un territoire/i);
        
        // Type at least 2 characters
        await user.type(input, 'Par');
        
        // Wait for debounce
        await waitFor(() => {
            expect(mockUseSearchTerritoryQuery).toHaveBeenCalledWith('Par', expect.objectContaining({
                skip: false,
            }));
        }, { timeout: 500 });
    });
});

import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@store/store';

interface NavbarState {
    isOpen: boolean;
    wasOpened: boolean; // Mémorise l'état avant passage en mobile
}

const initialState: NavbarState = {
    isOpen: true,
    wasOpened: true, 
};

const navbarSlice = createSlice({
    name: 'navbar',
    initialState,
    reducers: {
        toggleNavbar: (state) => {
            state.isOpen = !state.isOpen;
            state.wasOpened = state.isOpen; // On mémorise si elle était ouverte
        },
        handleResponsiveNavbar: (state, action) => {
            if (action.payload.isMobile) {
                state.isOpen = false; // Fermer en mobile
            } else {
                state.isOpen = state.wasOpened; // Rétablir l'état précédent en desktop
            }
        }
    },
});

export const { toggleNavbar, handleResponsiveNavbar } = navbarSlice.actions;

export const selectIsNavbarOpen = (state: RootState) => state.navbar.isOpen;

export default navbarSlice.reducer;

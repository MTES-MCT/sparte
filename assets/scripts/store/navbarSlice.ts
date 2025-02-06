import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@store/store';

interface NavbarState {
    isOpen: boolean;
    isClosedByUser: boolean;
}

const initialState: NavbarState = {
    isOpen: true,
    isClosedByUser: false,
};

const navbarSlice = createSlice({
    name: 'navbar',
    initialState,
    reducers: {
        toggleNavbar: (state) => {
            state.isOpen = !state.isOpen;
            state.isClosedByUser = !state.isOpen;
        },
        openNavbar: (state) => {
            state.isOpen = true;
        },
        closeNavbar: (state) => {
            state.isOpen = false;
        }
    },
});

export const { toggleNavbar, openNavbar, closeNavbar } = navbarSlice.actions;

export const selectIsNavbarOpen = (state: RootState) => state.navbar.isOpen;
export const selectIsNavbarClosedByUser = (state: RootState) => state.navbar.isClosedByUser;

export default navbarSlice.reducer;

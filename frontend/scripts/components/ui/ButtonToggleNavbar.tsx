import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleNavbar, selectIsNavbarOpen } from "@store/navbarSlice";
import { Tooltip } from "react-tooltip";
import styled from "styled-components";
import Button from "@components/ui/Button";

const ToggleButton = styled(Button)`
    margin-right: 1rem;

    i {
        font-size: 1rem;
        font-weight: 900;
    }
`;

const ButtonToggleNavbar: React.FC = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(selectIsNavbarOpen);

    return (
        <>
            <ToggleButton
                variant="secondary"
                icon="bi bi-layout-sidebar"
                onClick={() => dispatch(toggleNavbar())}
                data-tooltip-id="tooltip-close-sidebar"
                data-tooltip-content={isOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
                aria-label={isOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
            />
            <Tooltip id="tooltip-close-sidebar" className="fr-text--xs" />
        </>
    );
};

export default ButtonToggleNavbar;

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleNavbar, selectIsNavbarOpen } from "@store/navbarSlice";
import { Tooltip } from 'react-tooltip'
import styled from "styled-components";

const activeColor = '#4318FF';
const secondaryColor = '#a1a1f8';

const IconToggle = styled.i`
    font-size: 17px;
    padding: 7px 10px;
    border-radius: 9px;
    color: ${secondaryColor};
    cursor: pointer;
    margin-right: 1rem;
    transition: transform 0.3s ease;
    border: 1px solid #d5d9de;
    font-weight: 900;
    -webkit-text-stroke: 0.04rem;
    transition: color 0.3s ease;

    &:hover {
        color: ${activeColor};
    }
`;

const ButtonToggleNavbar: React.FC = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(selectIsNavbarOpen);

    return (
            <>
                <IconToggle 
                    className="bi bi-layout-sidebar" 
                    onClick={() => dispatch(toggleNavbar())}
                    data-tooltip-id="tooltip-close-sidebar"
                    data-tooltip-content={isOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
                />
                <Tooltip id="tooltip-close-sidebar" className="fr-text--xs" />
            </>
    );
};

export default ButtonToggleNavbar;
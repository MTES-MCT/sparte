import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useWindowSize from '@hooks/useWindowSize';
import { Tooltip } from 'react-tooltip'
import SearchBar from '@components/widgets/SearchBar';

interface HeaderData {
    logos: Logo[];
    search: {
        createUrl: string;
    };
    menuItems: MenuItem[];
}

interface Logo {
    src: string;
    alt: string;
    height?: string;
    url?: string; 
}

interface MenuItem {
    label: string;
    url: string;
    target?: string;
}

const activeColor = '#4318FF';
const secondaryColor = '#a1a1f8';

const HeaderContainer = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 1rem;
    background-color: #fff;
    border-bottom: 1px solid #EEF2F7;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 2rem;
    padding-right: 0.75rem;
`;

const Logo = styled.img<{ width?: string; height?: string }>`
    height: ${({ height }) => height || '50px'};
`;

const LogoLink = styled.a`
    background: none;
    text-decoration: none;
`;

const ButtonContainer = styled.div<{ $isMobile: boolean, $isMenuOpen: boolean }>`
    display: ${({ $isMobile, $isMenuOpen }) => ($isMobile ? ($isMenuOpen ? 'flex' : 'none') : 'flex')};
    flex-grow: 1;
    justify-content: end;
    ${({ $isMobile, $isMenuOpen }) => $isMobile && $isMenuOpen && `
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: #fff;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    `}
`;

const SearchBarContainer = styled.div<{ $isMobile: boolean }>`
    flex-grow: 1;
    margin: 0 2rem;
    display: flex;
    justify-content: end;
    max-width: 550px;
    ${({ $isMobile }) => $isMobile && `
        width: 100%;
    `}
`;

const NavLinks = styled.nav<{ $isMobile: boolean }>`
    display: flex;
    align-items: center;
    gap: 1rem;
    ${({ $isMobile }) => $isMobile && `
        flex-direction: column;
        width: 100%;
    `}
`;

const NavLink = styled.a`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.85em;
    font-weight: 500;
    text-decoration: none;
    background-image: none;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.2s ease;
    color: #000091;

    &:hover {
        color: #000091;
        background: #f6f6f6 !important;
    }
`;

const ButtonToggleMenu = styled.i<{ $isMobile: boolean }>`
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
    display: ${({ $isMobile }) => ($isMobile ? 'block' : 'none')};

    &:hover {
        color: ${activeColor};
    }
`;

const Header = () => {
    const [data, setData] = useState<HeaderData | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isMobile } = useWindowSize(980);

    // La composition du header et notamment les urls des liens sont récupérés via le contexte Django => project/templates/layout/base.html => #header-data
    useEffect(() => {
        const dataElement = document.getElementById('header-data');
        if (dataElement) {
            const parsedData = JSON.parse(dataElement.textContent || '{}');
            setData(parsedData);
        }
    }, []);

    // responsive
    useEffect(() => {
        if (isMobile)
            setIsMenuOpen(false); // Ferme le menu automatiquement si on passe en mode mobile
    }, [isMobile]);

    return (
        <HeaderContainer>
            <LogoContainer>
                {data?.logos.map((logo) => (
                    logo.url ? (
                        <LogoLink key={logo.src}  href={logo.url} rel="noopener noreferrer">
                            <Logo
                                src={logo.src}
                                alt={logo.alt}
                                height={logo.height}
                            />
                        </LogoLink>
                    ) : (
                        <Logo
                            key={logo.src}
                            src={logo.src}
                            alt={logo.alt}
                            height={logo.height}
                        />
                    )
                ))}
            </LogoContainer>
            <ButtonToggleMenu
                className="bi bi-list"
                $isMobile={isMobile}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                data-tooltip-id="tooltip-close-sidebar"
                data-tooltip-content={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            />
            <Tooltip id="tooltip-close-sidebar" className="fr-text--xs" />
            <ButtonContainer $isMobile={isMobile} $isMenuOpen={isMenuOpen}>
                <SearchBarContainer $isMobile={isMobile}>
                    <SearchBar createUrl={data?.search.createUrl} />
                </SearchBarContainer>
                <NavLinks $isMobile={isMobile}>
                    {data?.menuItems.map((item) => (
                        <NavLink
                            key={item.label}
                            href={item.url}
                            target={item.target}
                            rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </NavLinks>
            </ButtonContainer>
        </HeaderContainer>
    );
};

export default Header;

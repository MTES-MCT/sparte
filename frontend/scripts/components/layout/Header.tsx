import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import useWindowSize from '@hooks/useWindowSize';
import { Tooltip } from 'react-tooltip'
import SearchBar from '@components/ui/SearchBar';
import type { SubMenuItem } from '@services/types/project';
interface Logo {
    src: string;
    alt: string;
    height?: string;
    url?: string;
}

const activeColor = '#4318FF';
const secondaryColor = '#a1a1f8';

const HeaderContainer = styled.header`
    position: relative;
    width: 100%;
    height: 80px;
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
    display: ${({ $isMobile, $isMenuOpen }) => {
        if (!$isMobile) return 'flex';
        return $isMenuOpen ? 'flex' : 'none';
    }};
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

const DropdownWrapper = styled.div`
    position: relative;
`;

const DropdownButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.85em;
    font-weight: 500;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    color: #000091;
    transition: background 0.2s ease;

    &:hover {
        color: #000091;
        background: #f6f6f6 !important;
    }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 180px;
    background: #fff;
    border: 1px solid #EEF2F7;
    border-radius: 4px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    padding: 0.25rem 0;
`;

const DropdownItem = styled.a`
    display: block;
    padding: 0.5rem 1rem;
    font-size: 0.85em;
    font-weight: 500;
    text-decoration: none;
    background-image: none;
    color: #000091;
    white-space: nowrap;

    &:hover {
        color: #000091;
        background: #f6f6f6;
    }
`;

const Dropdown = ({ label, items }: { label: string; items: SubMenuItem[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <DropdownWrapper ref={ref}>
            <DropdownButton onClick={() => setIsOpen(!isOpen)}>
                {label}
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7em' }} />
            </DropdownButton>
            <DropdownMenu $isOpen={isOpen}>
                {items.map(item => (
                    <DropdownItem key={item.label} href={item.url}>
                        {item.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </DropdownWrapper>
    );
};

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

const Header = ({ header }: { header: { logos: Logo[]; search: Record<string, never>; menuItems: { label: string; url?: string; target?: string; shouldDisplay?: boolean; subMenu?: SubMenuItem[] }[] } }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isMobile } = useWindowSize(980);

    // responsive
    useEffect(() => {
        if (isMobile) {
            setIsMenuOpen(false);
        }
    }, [isMobile]);

    return (
        <HeaderContainer>
            <LogoContainer>
                {header?.logos.map((logo) => (
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
                data-tooltip-id="tooltip-close-menu"
                data-tooltip-content={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            />
            <Tooltip id="tooltip-close-menu" className="fr-text--xs" />
            <ButtonContainer $isMobile={isMobile} $isMenuOpen={isMenuOpen}>
                <SearchBarContainer $isMobile={isMobile}>
                    <SearchBar />
                </SearchBarContainer>
                <NavLinks $isMobile={isMobile}>
                    {header?.menuItems.filter(({ shouldDisplay }) => shouldDisplay).map(item =>
                        item.subMenu ? (
                            <Dropdown key={item.label} label={item.label} items={item.subMenu} />
                        ) : (
                            <NavLink
                                key={item.label}
                                href={item.url}
                                target={item.target}
                                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                            >
                                {item.label}
                            </NavLink>
                        )
                    )}
                </NavLinks>
            </ButtonContainer>
        </HeaderContainer>
    );
};

export default Header;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const HeaderContainer = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 1rem;
    background-color: #fff;
    border-bottom: 1px solid #EEF2F7;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
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

const ButtonContainer = styled.div`
    display: flex;
    flex-grow: 1;
    justify-content: end;
`;

const SearchBarContainer = styled.div`
    flex-grow: 1;
    margin: 0 2rem;
    display: flex;
    justify-content: end;
    max-width: 550px;
`;

const NavLinks = styled.nav`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        margin-top: 1rem;
    }
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

    @media (max-width: 768px) {
        margin-left: 0;
        margin-right: 1rem;
    }
`;

const Header = () => {
    const [data, setData] = useState<HeaderData | null>(null);

    // La composition du header et notamment les urls des liens sont récupérés via le contexte Django => project/templates/layout/base.html => #header-data
    useEffect(() => {
        const dataElement = document.getElementById('header-data');
        if (dataElement) {
            const parsedData = JSON.parse(dataElement.textContent || '{}');
            setData(parsedData);
        }
    }, []);

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
            <ButtonContainer>
                <SearchBarContainer>
                    <SearchBar createUrl={data?.search.createUrl} />
                </SearchBarContainer>
                <NavLinks>
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

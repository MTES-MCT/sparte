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

const Header: React.FC<{ headerData: HeaderData }> = ({ headerData }) => {
    const [data, setData] = useState<HeaderData | null>(null);

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
                {data?.logos.map((logo, index) => (
                    logo.url ? (
                        <LogoLink key={index} href={logo.url} rel="noopener noreferrer">
                            <Logo
                                key={index}
                                src={logo.src}
                                alt={logo.alt}
                                height={logo.height}
                            />
                        </LogoLink>
                    ) : (
                        <Logo
                            key={index}
                            src={logo.src}
                            alt={logo.alt}
                            height={logo.height}
                        />
                    )
                ))}
            </LogoContainer>
            <SearchBar createUrl={data?.search.createUrl} />
            <NavLinks>
                {data?.menuItems.map((item, index) => (
                    <NavLink key={index} href={item.url} target={item.target} rel="noopener noreferrer">
                        {item.label}
                    </NavLink>
                ))}
            </NavLinks>
        </HeaderContainer>
    );
};

export default Header;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface FooterData {
    menuItems: MenuItem[];
}

interface MenuItem {
    label: string;
    url: string;
    target?: string;
}

const Container = styled.div`
    font-size: 0.8em;
    padding: 2rem 1rem;
`;

const NavLinks = styled.nav`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const NavLink = styled.a`
    padding: 0.25rem 0.75rem;
    font-size: 0.85em;
    font-weight: 500;
    text-decoration: none;
    background-image: none;
    -webkit-tap-highlight-color: transparent;
    transition: color .3s ease;
    color: #979FB8;

    &:hover {
        color: #4318FF;
    }
`;

const Footer = () => {
    const [data, setData] = useState<FooterData | null>(null);

    useEffect(() => {
        const dataElement = document.getElementById('footer-data');
        if (dataElement) {
            const parsedData = JSON.parse(dataElement.textContent || '{}');
            setData(parsedData);
        }
    }, []);

    return (
        <Container className="fr-container--fluid">
            <div className="fr-grid-row">
                <div className="fr-col-12">
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
                </div>
            </div>
        </Container>
    );
};

export default Footer;

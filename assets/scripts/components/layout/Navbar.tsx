import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import ProjectDownload from '@components/widgets/ProjectDownload';

interface NavbarData {
    menuItems: MenuItems[];
}

interface MenuItems {
    label: string;
    url?: string;
    icon: string;
    subMenu?: subMenu[];
}

interface subMenu {
    label: string;
    url: string;
    icon: string;
}

const primaryColor = 'var(--text-title-grey)';
const activeColor = '#4318FF';

const MenuStyle = css`
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    font-size: 0.85em;
    font-weight: 500;
`;

const LinkStyle = css<{ $isActive: boolean }>`
    text-decoration: none;
    background-image: none;
    background-color: inherit !important;
    border-right: 4px solid transparent;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.2s ease, border-color 0.3s ease;
    border-right: 4px solid transparent;
    border-color: ${({ $isActive }) => ($isActive ? "#6a6af4" : "transparent")};
    color: ${({ $isActive }) => ($isActive ? activeColor : primaryColor)};

    &:hover {
        color: ${activeColor};
    }
    &:active {
        background: none;
    }
`;

const Container = styled.aside`
    position: fixed;
    left: 0;
    top: 80px;
    bottom: 0;
    width: 280px;
    display: flex;
    flex-direction: column;
    background: ##04023c;
    border-right: 1px solid #EEF2F7;
`;

const MenuList = styled.ul`
    list-style: none;
    padding: 1rem 0 0;
    margin: 0;
    flex: 1 1 0%;
    overflow-y: auto;
`;

const Menu = styled.li`
    padding: 0;
    margin-bottom: 1rem;
`;

const MenuTitle = styled.div`
    ${MenuStyle}
    color: ${primaryColor};
    cursor: default;
`;

const MenuTitleLink = styled(Link)<{ $isActive: boolean }>`
    ${MenuStyle}
    ${LinkStyle}
`;

const SubMenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 0.5em;
`;


const SubMenu = styled.li`
    padding-left: 0.1rem;
    border-left: 1px solid #E0E1FF;
    margin-left: 1.4rem;
    position: relative;
`;

const SubMenuTitleLink = styled(Link)<{ $isActive: boolean }>`
    ${MenuStyle}
    ${LinkStyle}
`;

const Icon = styled.i`
    margin-right: 0.7em;
`;

const Navbar: React.FC = () => {
    const location = useLocation();
    const [data, setData] = useState<NavbarData | null>(null);

    useEffect(() => {
        const dataElement = document.getElementById('navbar-data');
        if (dataElement) {
            const data = JSON.parse(dataElement.textContent || '{}');
            setData(data);
        }
    }, []);

    const isActive = (url?: string) => location.pathname === url;

    const renderMenuItems = (items: subMenu[]) => (
        <SubMenuList>
            {items.map(item => (
                <SubMenu
                    key={item.label}
                    role="treeitem"
                >
                    <SubMenuTitleLink to={item.url} $isActive={isActive(item.url)}>
                        {item.icon && <Icon className={`bi ${item.icon}`} />}
                        {item.label}
                    </SubMenuTitleLink>
                </SubMenu>
            ))}
        </SubMenuList>
    );

    return (
        <Container aria-label="Sidebar">
            <MenuList role="tree" aria-label="Sidebar menu">
                {data?.menuItems.map((menu, index) => (
                    <Menu key={index}>
                        {menu.url ? (
                            <MenuTitleLink to={menu.url} $isActive={isActive(menu.url)}>
                                {menu.icon && <Icon className={`bi ${menu.icon}`} />}
                                {menu.label}
                            </MenuTitleLink>
                        ) : (
                            <MenuTitle>
                                {menu.icon && <Icon className={`bi ${menu.icon}`} />}
                                {menu.label}
                            </MenuTitle>
                        )}
                        {menu.subMenu && renderMenuItems(menu.subMenu)}
                    </Menu>
                ))}
            </MenuList>
            <ProjectDownload />
        </Container>
    );
};

export default Navbar;
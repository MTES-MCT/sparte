import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

interface MenuItem {
    label: string;
    url?: string;
    subMenu?: MenuItem[];
    icon?: string;
}

const NavbarContainer = styled.nav`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const MenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const MenuItemContainer = styled.li`
    padding: 0;
    margin: 0;
    font-weight: 500;
    color: #A3AED0;
    
    &.is-menu {
        margin-bottom: 1em;
    }

    & > a {
        padding: 1vh 1vw;
        text-decoration: none;
        background-image: none;
        transition: color 0.2s ease, border-color 0.3s ease;
        display: flex;
        width: 100%;
        font-size: 0.9em;
        border-right: 4px solid transparent;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            color: #2B3674;
        }

        &:active {
            background: none;
        }
    }

    & > span {
        display: flex;
        align-items: center;
        cursor: default;
        padding: 1vh 1vw;
        font-size: 0.9em;
    }

    &.active {
        a {
            color: #2B3674;
            border-right: 4px solid #6A6AF4;
        }

        i {
            color: #4318FF;
        }
    }
`;

const SubMenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    padding-left: 0.4em;
    border-left: 1px solid #dae0ef;
    margin-left: 1.1em;
`;

const Icon = styled.i`
    margin-right: 0.7em;
`;

const Navbar: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const location = useLocation();
    const path = location.pathname;
    const projectIdMatch = path.match(/\/project\/(\d+)/);
    const projectId = projectIdMatch ? projectIdMatch[1] : null;

    useEffect(() => {
        const getNavbarData = () => {
            const scriptElement = document.getElementById('navbar-data');
            if (scriptElement) {
                const { menuItems, currentUrl } = JSON.parse(scriptElement.textContent || '{}');
                setMenuItems(menuItems);
                setCurrentUrl(currentUrl);
            }
        };
        
        getNavbarData();
    }, []);

    const renderMenuItems = (items: MenuItem[], isSubMenu: boolean = false) => (
        <MenuList role="tree" aria-label="Sidebar menu">
            {items.map(item => (
                <MenuItemContainer
                    key={item.label}
                    role="treeitem"
                    className={`${location.pathname === item.url ? 'active' : ''} ${isSubMenu ? '' : 'is-menu'}`}
                >
                    {item.url ? (
                        <Link 
                            to={item.url.replace(':projectId', projectId || '')}
                            aria-current={currentUrl === item.url ? 'page' : undefined}
                        >
                            {item.icon && <Icon className={`bi ${item.icon}`} />}
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            role="button"
                            aria-haspopup="true"
                        >
                            {item.icon && <Icon className={`bi ${item.icon}`} />}
                            {item.label}
                        </span>
                    )}
                    {item.subMenu && (
                        <SubMenuList role="group">
                            {renderMenuItems(item.subMenu, true)}
                        </SubMenuList>
                    )}
                </MenuItemContainer>
            ))}
        </MenuList>
    );

    return (
        <NavbarContainer aria-label="Sidebar">
            {renderMenuItems(menuItems)}
        </NavbarContainer>
    );
};

export default Navbar;


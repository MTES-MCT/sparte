import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface MenuItem {
    label: string;
    url?: string;
    subMenu?: MenuItem[];
    icon?: string;
}

interface SidebarProps {
    menuItems: MenuItem[];
    currentUrl: string;
}

const SidebarContainer = styled.nav`
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

// const BottomSection = styled.div`
//     margin: 1em;
//     padding: 3em 1em;
//     border: 2px solid #4318FF;
//     border-radius: 8px;
//     text-align: center;
//     font-size: 0.9em;
//     color: #fff;
//     display: flex;
//     align-items: center;
//     justify-content: center;

//     i {
//         margin-right: 0.5em;
//     }
// `;

const Sidebar: React.FC<SidebarProps> = ({ menuItems, currentUrl }) => {
    const [activeUrl, setActiveUrl] = useState<string | null>(currentUrl);

    const handleClick = (url?: string) => {
        if (url) {
            setActiveUrl(url);
        }
    };

    const renderMenuItems = (items: MenuItem[], isSubMenu: boolean = false) => (
        <MenuList role="tree" aria-label="Sidebar menu">
            {items.map(item => (
                <MenuItemContainer
                    key={item.label}
                    role="treeitem"
                    className={`${activeUrl === item.url ? 'active' : ''} ${isSubMenu ? '' : 'is-menu'}`}
                >
                    {item.url ? (
                        <a 
                            href={item.url}
                            hx-get={item.url}
                            aria-current={activeUrl === item.url ? 'page' : undefined}
                            hx-target="#htmx-dashboard-content"
                            hx-push-url="true"
                            onClick={() => handleClick(item.url)}
                        >
                            {!isSubMenu && item.icon && <Icon className={item.icon} />}
                            {item.label}
                        </a>
                    ) : (
                        <span
                            role="button"
                            aria-haspopup="true"
                        >
                            {!isSubMenu && item.icon && <Icon className={item.icon} />}
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
        <SidebarContainer aria-label="Sidebar">
            {renderMenuItems(menuItems)}
            {/* <BottomSection>
                <Icon className="bi bi-tree-fill" />
                <p className="fr-logo">
                    <span className="fr-logo__text">
                        République
                        Française
                    </span>
                </p>
            </BottomSection> */}
        </SidebarContainer>
    );
};

export default Sidebar;
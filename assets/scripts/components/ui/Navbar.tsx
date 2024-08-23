import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';

interface NavbarData {
    logo: string;
    menus: Menu[];
}

interface Menu {
    title: string;
    menuItems: MenuItem[];
}

interface MenuItem {
    label: string;
    url?: string;
    subMenu?: MenuItem[];
    icon?: string;
}

const NavbarContainer = styled.aside`
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid #EEF2F7;
`;

const LogoContainer = styled.div`
    padding: 2.5rem 1rem;
    display: flex;
    gap: 1rem;
    
    & > img {
        width: 100%;
        max-width: 180px;
    }

    & > .fr-logo {
        font-size: 0.7em;
    }
`;

const UserContainer = styled.div`
    padding: 1rem;
    margin: 1rem;
    background: #eaeaea;
    border-radius: 8px;
`;

const MenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1 1 0%;
    overflow-y: auto;
`;

const MenuContainer = styled.li`
    border-bottom: 1px solid #EEF2F7;
`;

const MenuItemContainer = styled.li<{ $isSubMenu: boolean, $isActive: boolean }>`
    padding: 0;
    margin: 0;
    font-weight: 500;
    color: #A3AED0;
    margin-bottom: ${({ $isSubMenu }) => ($isSubMenu ? '0' : '0.5em')};

    & > a {
        padding: 0.6rem 1rem;
        text-decoration: none;
        background-image: none;
        transition: color 0.2s ease, border-color 0.3s ease;
        display: flex;
        width: 100%;
        font-size: 0.9em;
        border-right: 4px solid transparent;
        -webkit-tap-highlight-color: transparent;
        color: ${({ $isActive }) => ($isActive ? '#4318FF' : 'inherit')};
        border-right: ${({ $isActive }) => ($isActive ? '4px solid #6A6AF4' : '4px solid transparent')};

        &:hover {
            color: #4318FF;
        }

        &:active {
            background: none;
        }
    }
`;

const SubMenuTitle = styled.div`
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    font-size: 0.9em;
`;

const SubMenuContainer = styled.div`
    padding-left: 0.1rem;
    border-left: 1px solid #dae0ef;
    margin-left: 1.4rem;
`;

const SubMenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 0.5em;
`;

const Icon = styled.i`
    margin-right: 0.7em;
`;

const ChevronIcon = styled.i<{ $isOpen: boolean }>`
    margin-left: auto;
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(90deg)' : 'rotate(0deg)'};
    font-size: 0.8em; 
`;

const MenuTitle = styled.div`
    font-size: 0.9rem;
    font-weight: bold;
    color: #2B3674;
    padding: 1rem;
    margin: 0;
`;

const FooterContainer = styled.div`
    margin: 1rem;
    display: flex;
    align-items: end;
    justify-content: space-between;

    .fr-logo {
        font-size: 0.8em;
    }

    a {
        color: #A3AED0;
        background: none;
        font-size: 0.9em;
        transition: color .3s ease;

        &:hover {
            color: #2B3674;
        }
    }
`;

const FooterLinks = styled.div`
    display: flex;
    flex-direction: column;
`;

const Navbar: React.FC = () => {
    const location = useLocation();
    const [data, setData] = useState<NavbarData | null>(null);
    const [openSubMenus, setOpenSubMenus] = useState<Set<string>>(new Set());

    useEffect(() => {
        const dataElement = document.getElementById('navbar-data');
        if (dataElement) {
            const data = JSON.parse(dataElement.textContent || '{}');
            setData(data);
        }
    }, []);

    const isActive = (url?: string) => location.pathname === url;

    const toggleSubMenu = (label: string) => {
        setOpenSubMenus(prevOpenSubMenus => {
            const newOpenSubMenus = new Set(prevOpenSubMenus);
            if (newOpenSubMenus.has(label)) {
                newOpenSubMenus.delete(label);
            } else {
                newOpenSubMenus.add(label);
            }
            return newOpenSubMenus;
        });
    };

    const renderMenuItems = (items: MenuItem[], isSubMenu: boolean = false) => (
        <SubMenuList>
            {items.map(item => (
                <MenuItemContainer
                    $isSubMenu={isSubMenu}
                    $isActive={isActive(item.url)}
                    key={item.label}
                    role="treeitem"
                >
                    {item.url ? (
                        <Link to={item.url}>
                            {item.icon && <Icon className={`bi ${item.icon}`} />}
                            {item.label}
                        </Link>
                    ) : (
                        <div>
                            <SubMenuTitle
                                role="button"
                                aria-haspopup="true"
                                onClick={() => item.subMenu && toggleSubMenu(item.label)}
                            >
                                {item.icon && <Icon className={`bi ${item.icon}`} />}
                                {item.label}
                                {item.subMenu && <ChevronIcon $isOpen={openSubMenus.has(item.label)} className="bi-chevron-right" />}
                            </SubMenuTitle>
                            {item.subMenu && openSubMenus.has(item.label) && (
                                <SubMenuContainer role="group">
                                    {renderMenuItems(item.subMenu, true)}
                                </SubMenuContainer>
                            )}
                        </div>
                    )}
                </MenuItemContainer>
            ))}
        </SubMenuList>
    );

    return (
        <NavbarContainer aria-label="Sidebar">
            { data?.logo && (
                <LogoContainer>
                    {/* <div className="fr-logo">
                        <div className="fr-logo__text">
                            République
                        </div>
                        <div className="fr-logo__text">
                            Française
                        </div>
                    </div> */}
                    <img src={data.logo} alt=""/>
                </LogoContainer>
            )}
            { data?.menus && (
                <MenuList role="tree" aria-label="Sidebar menu">
                    {data.menus.map((menu, index) => (
                        <MenuContainer key={index}>
                            { menu.title && (<MenuTitle>{menu.title}</MenuTitle>)}
                            {renderMenuItems(menu.menuItems)}
                        </MenuContainer>
                    ))}
                </MenuList>
            )}
            <FooterContainer>
                {/* <FooterLinks>
                    <a target="_blank" href="https://faq.mondiagartif.beta.gouv.fr/fr/" rel="noopener noreferrer">
                        FAQ
                    </a>
                    <a target="_blank" href="https://mondiagartif.beta.gouv.fr/documentation/tutoriel" rel="noopener noreferrer">
                        Tutoriel
                    </a>
                    <a target="_blank" href="https://mondiagartif.beta.gouv.fr/documentation/tutoriel" rel="noopener noreferrer">
                        Documentation
                    </a>
                </FooterLinks> */}
                {/* <UserContainer>
                <i className="bi bi-person-circle"></i>
                <div>Sofian Thibaut</div>
                <p className="fr-badge fr-badge--info fr-badge--sm">Commune</p>
                <p className="fr-badge fr-badge--info fr-badge--sm">Développeur</p>
            </UserContainer> */}
            <div className="fr-logo">
                <div className="fr-logo__text">
                    République
                </div>
                <div className="fr-logo__text">
                    Française
                </div>
            </div>
            </FooterContainer>
        </NavbarContainer>
    );
};

export default Navbar;

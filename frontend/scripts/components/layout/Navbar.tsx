import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { toggleNavbar, selectIsNavbarOpen, handleResponsiveNavbar } from '@store/navbarSlice';
import useHtmx from '@hooks/useHtmx';
import useWindowSize from '@hooks/useWindowSize';
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";
import { MenuItem, ProjectDetailResultType } from '@services/types/project';
import { LandDetailResultType } from '@services/types/land';

const primaryColor = '#313178';
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

const Container = styled.aside<{ $isOpen: boolean; $isMobile: boolean; $height: string }>`
    position: ${({ $isMobile }) => ($isMobile ? 'fixed' : 'sticky')};
    top: 0;
    width: ${({ $isOpen, $isMobile }) => ($isMobile || $isOpen ? '280px' : '0')};
    height: ${({ $height }) => $height};
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: ${({ $isOpen, $isMobile }) => ($isMobile || $isOpen ? '1px solid #EEF2F7' : 'none')};
    z-index: 999;
    overflow: hidden;
    transform: ${({ $isMobile, $isOpen }) => ($isMobile && !$isOpen ? 'translate3d(-280px, 0, 0)' : 'translate3d(0, 0, 0)')};
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    align-self: flex-start;
    
    ${({ $isMobile }) => $isMobile && `
        left: 0;
        bottom: 0;
    `}
`;

const MenuList = styled.ul`
    list-style: none;
    padding: 1rem 0 0;
    margin: 0;
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

const SubMenuTitleLink = styled(Link)<{ $isActive: boolean, $disabled: boolean }>`
    ${MenuStyle}
    ${LinkStyle}
    cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

const SubMenuTitle = styled.div`
    ${MenuStyle}
    color: ${primaryColor};
    cursor: not-allowed;
`;

const Icon = styled.i`
    margin-right: 0.7em;
`;

const DownloadLink = styled(Link)`
    width: 90%;
    font-size: 0.85em;
    margin: 1em;
`;

const NavContainer = styled.div`
    flex: 1 1 0%;
    overflow-y: auto;
    min-height: 0;
`;

const NavbarHeader = styled.div`
    display: flex;
    padding: 1.5rem 1rem;
    padding-bottom: 0.5rem;
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    transition: opacity 0.3s ease;
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
    z-index: 998;
`;

const MenuText = styled.span<{ $disabled?: boolean }>`
    color: ${({ $disabled }) => $disabled ? 'var(--grey-200-850-hover)' : 'inherit'};
`;

const MenuItemContent: React.FC<{ item: MenuItem }> = ({ item }) => (
    <>
        {item.icon && <Icon className={`bi ${item.icon}`} />}
        <div className="d-flex flex-column items-center">
            {item.new && (<p className="fr-badge fr-badge--sm fr-badge--new">Nouveau</p>)}
            {item.soon && (<p className="fr-badge fr-badge--sm fr-badge--info">Bientôt</p>)}
            <MenuText $disabled={!item.url}>{item.label}</MenuText>
        </div>
    </>
);

interface MenuItemsProps {
    items: MenuItem[];
    isActive: (url?: string) => boolean;
    isMobile: boolean;
    onToggleNavbar: () => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ items, isActive, isMobile, onToggleNavbar }) => (
    <SubMenuList>
        {items.map(item => (
            <SubMenu
                key={item.label}
                role="treeitem"
            >
                {item.url ? (
                    <SubMenuTitleLink
                        to={item.url}
                        $isActive={isActive(item.url)}
                        $disabled={item.soon}
                        onClick={() => isMobile && onToggleNavbar()}
                    >
                        <MenuItemContent item={item} />
                    </SubMenuTitleLink>
                ) : (
                    <SubMenuTitle>
                        <MenuItemContent item={item} />
                    </SubMenuTitle>
                )}
            </SubMenu>
        ))}
    </SubMenuList>
);

interface DownloadItemsProps {
    downloadsUrl: string;
}

const DownloadItems: React.FC<DownloadItemsProps> = ({ downloadsUrl }) => (
    <DownloadLink 
        to={downloadsUrl}
        className="fr-btn fr-btn--icon-left fr-icon-download-line"
    >
        Générer un rapport
    </DownloadLink>
);

const Navbar: React.FC<{ projectData: ProjectDetailResultType, landData: LandDetailResultType }> = ({ projectData, landData }) => {
    const location = useLocation();
    const { navbar, urls } = projectData

    const htmxRef = useHtmx([urls]);

    const dispatch = useDispatch();
    const isOpen = useSelector(selectIsNavbarOpen);
    const { isMobile } = useWindowSize();
    const [navbarHeight, setNavbarHeight] = useState<string>('calc(100vh - 80px)');

    const shouldDisplayDownloads = landData.has_conso

    const isActive = (url?: string) => location.pathname === url;

    // Calcul dynamique de la hauteur selon le scroll
    useEffect(() => {
        if (isMobile) {
            setNavbarHeight('100vh');
            return;
        }

        const updateHeight = () => {
            const scrollY = window.scrollY;
            // Si on a scrollé au-delà du header (80px), la navbar prend 100vh
            // Sinon, elle prend calc(100vh - 80px) pour laisser la place au header
            const height = scrollY >= 80 ? '100vh' : 'calc(100vh - 80px)';
            setNavbarHeight(height);
        };

        updateHeight();
        window.addEventListener('scroll', updateHeight, { passive: true });
        return () => window.removeEventListener('scroll', updateHeight);
    }, [isMobile]);

    // responsive
    useEffect(() => {
        dispatch(handleResponsiveNavbar({ isMobile }));
    }, [isMobile, dispatch]);

    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen, isMobile]);


    return (
        <>
            {isMobile && <Overlay $isOpen={isOpen} onClick={() => dispatch(toggleNavbar())} />}
            <Container aria-label="Sidebar" ref={htmxRef} $isOpen={isOpen} $isMobile={isMobile} $height={navbarHeight}>
                <NavbarHeader>
                    <ButtonToggleNavbar />
                </NavbarHeader>
                <NavContainer>
                    <MenuList role="tree" aria-label="Sidebar menu">
                        {navbar?.menuItems.map((menu) => (
                            <Menu key={menu.label}>
                                {menu.url ? (
                                    <MenuTitleLink
                                        to={menu.url}
                                        $isActive={isActive(menu.url)}
                                        onClick={() => isMobile && dispatch(toggleNavbar())}
                                    >
                                        {menu.icon && <Icon className={`bi ${menu.icon}`} />}
                                        {menu.label}
                                    </MenuTitleLink>
                                ) : (
                                    <MenuTitle>
                                        {menu.icon && <Icon className={`bi ${menu.icon}`} />}
                                        {menu.label}
                                    </MenuTitle>
                                )}
                                {menu.subMenu && (
                                    <MenuItems 
                                        items={menu.subMenu}
                                        isActive={isActive}
                                        isMobile={isMobile}
                                        onToggleNavbar={() => dispatch(toggleNavbar())}
                                    />
                                )}
                            </Menu>
                        ))}
                    </MenuList>
                </NavContainer>
                {shouldDisplayDownloads && urls.downloads && (
                    <DownloadItems downloadsUrl={urls.downloads} />
                )}
            </Container>
        </>
    );
};

export default Navbar;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { toggleNavbar, selectIsNavbarOpen, handleResponsiveNavbar } from '@store/navbarSlice';
import useHtmx from '@hooks/useHtmx';
import useWindowSize from '@hooks/useWindowSize';
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";
import { ConsoCorrectionStatusEnum } from '@components/features/status/ConsoCorrectionStatus';
import { MenuItem, ProjectDetailResultType } from '@services/types/project';

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

const Container = styled.aside<{ $isOpen: boolean }>`
    position: fixed;
    left: ${({ $isOpen }) => ($isOpen ? '0' : '-280px')};
    top: 80px;
    bottom: 0;
    width: 280px;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid #EEF2F7;
    transition: left 0.3s ease;
    z-index: 999;
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
    z-index: 999;
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

const Navbar: React.FC<{ projectData: ProjectDetailResultType }> = ({ projectData }) => {
    const location = useLocation();
    const { navbar, urls } = projectData

    const htmxRef = useHtmx([urls]);

    const dispatch = useDispatch();
    const isOpen = useSelector(selectIsNavbarOpen);
    const { isMobile } = useWindowSize();

    const shouldDisplayDownloads = [
        ConsoCorrectionStatusEnum.UNCHANGED,
        ConsoCorrectionStatusEnum.FUSION,
    ].includes(projectData.consommation_correction_status);


    const isActive = (url?: string) => location.pathname === url;

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

    const renderMenuItems = (items: MenuItem[]) => (
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
                            onClick={() => isMobile && dispatch(toggleNavbar())}
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

    const renderDownloadItems = () => (
        <DownloadLink 
            to={urls.downloads}
            className="fr-btn fr-btn--icon-left fr-icon-download-line"
        >
            Téléchargements
        </DownloadLink>
    );

    return (
        <>
            {isMobile && <Overlay $isOpen={isOpen} onClick={() => dispatch(toggleNavbar())} />}
            <Container aria-label="Sidebar" ref={htmxRef} $isOpen={isOpen}>
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
                                {menu.subMenu && renderMenuItems(menu.subMenu)}
                            </Menu>
                        ))}
                    </MenuList>
                </NavContainer>
                {shouldDisplayDownloads && urls.downloads && (
                    renderDownloadItems()
                )}
            </Container>
        </>
    );
};

export default Navbar;

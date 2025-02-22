import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { toggleNavbar, selectIsNavbarOpen, handleResponsiveNavbar } from '@store/navbarSlice';
import useHtmx from '@hooks/useHtmx';
import useWindowSize from '@hooks/useWindowSize';
import useUrls from '@hooks/useUrls';
import Button from '@components/ui/Button';
import ButtonToggleNavbar from "@components/ui/ButtonToggleNavbar";
import { ConsoCorrectionStatusEnum } from '@components/widgets/ConsoCorrectionStatus';

interface NavbarData {
    menuItems: MenuItems[];
}

interface MenuItems {
    label: string;
    url?: string;
    icon: string;
    subMenu?: SubMenu[];
}

interface SubMenu {
    label: string;
    url: string;
    icon: string;
}

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

const SubMenuTitleLink = styled(Link)<{ $isActive: boolean }>`
    ${MenuStyle}
    ${LinkStyle}
`;

const Icon = styled.i`
    margin-right: 0.7em;
`;

const DownloadList = styled.ul<{ $isMobile: boolean }>`
    margin: 0;
    padding: 0;
    list-style-type: none;
    ${({ $isMobile }) => !$isMobile && `
        height: 0;
        overflow: hidden;
        transition: height 0.3s ease;
    `}
`;

const DownloadContainer = styled.div<{ $isMobile: boolean }>`
    margin: 1rem;
    padding: 1rem;
    border-radius: 6px;
    background: #cacafb;

    ${({ $isMobile }) => !$isMobile && `
        &:hover ${DownloadList} {
            height: 192px;
        }
    `}
`;

const DownloadTitle = styled.div`
    color: ${activeColor};
    font-size: 0.9em;
    display: flex;
    align-items: center;
    gap: 0.2rem;
    flex-direction: column;
    font-weight: 500;

    i {
        font-size: 1.2em;
        background: ${activeColor};
        color: #fff;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
`;

const DownloadListItem = styled.li`
    & > a, & > button {
        width: 100%;
    }

    &:first-child {
        margin-top: 1rem;
    }
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


const Navbar: React.FC<{ projectData: any }> = ({ projectData }) => {
    const location = useLocation();
    const [data, setData] = useState<NavbarData | null>(null);
    const urls = useUrls();
    const htmxRef = useHtmx([urls]);

    const dispatch = useDispatch();
    const isOpen = useSelector(selectIsNavbarOpen);
    const { isMobile } = useWindowSize();

    const shouldDisplayDownloads = [
        ConsoCorrectionStatusEnum.UNCHANGED,
        ConsoCorrectionStatusEnum.FUSION,
    ].includes(projectData.consommation_correction_status);

    // La composition de la navbar et notamment les urls des liens sont récupérés via le contexte Django => project/templates/layout/base.html => #navbar-data
    useEffect(() => {
        const dataElement = document.getElementById('navbar-data');
        if (dataElement) {
            const data = JSON.parse(dataElement.textContent || '{}');
            setData(data);
        }
    }, []);

    const isActive = (url?: string) => location.pathname === url;

    // Temporaire => Il faudrait utiliser la modal de react dsfr
    const resetModalContent = () => {
        const modalContent = document.getElementById('diag_word_form');
        if (modalContent) {
            modalContent.innerHTML = '<div class="fr-custom-loader"></div>';
        }
    };

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

    const renderMenuItems = (items: SubMenu[]) => (
        <SubMenuList>
            {items.map(item => (
                <SubMenu
                    key={item.label}
                    role="treeitem"
                >
                    <SubMenuTitleLink
                        to={item.url}
                        $isActive={isActive(item.url)}
                        onClick={() => isMobile && dispatch(toggleNavbar())}
                    >
                        {item.icon && <Icon className={`bi ${item.icon}`} />}
                        <div className="d-flex flex-column items-center">
                            {item.label === "Vacance des logements" && (<p className="fr-badge fr-badge--sm fr-badge--new">Nouveau</p>)}
                            {item.label}
                        </div>
                    </SubMenuTitleLink>
                </SubMenu>
            ))}
        </SubMenuList>
    );

    const renderDownloadItems = () => (
        <DownloadContainer $isMobile={isMobile}>
            <DownloadTitle>
                <i className="bi bi-box-arrow-down"></i>
                <div>Téléchargements</div>
            </DownloadTitle>
            <DownloadList $isMobile={isMobile}>
                <DownloadListItem>
                    <Button
                        type="htmx"
                        icon="bi bi-file-earmark-word"
                        label="Analyse de Consommation"
                        htmxAttrs={{
                            'data-hx-get': urls.dowloadConsoReport,
                            'data-hx-target': '#diag_word_form',
                            'data-fr-opened': 'false',
                            'aria-controls': 'fr-modal-download-word',
                        }}
                        onClick={() => {
                            resetModalContent();
                            if (window.trackEvent)
                                window.trackEvent(
                                    'diagnostic_download_funnel',
                                    'click_button_conso_report_download',
                                    'conso_report_download_button_clicked'
                                );
                        }}
                    />
                </DownloadListItem>
                <DownloadListItem>
                    <Button
                        type="htmx"
                        icon="bi bi-file-earmark-word"
                        label="Analyse complète"
                        htmxAttrs={{
                            'data-hx-get': urls.dowloadFullReport,
                            'data-hx-target': '#diag_word_form',
                            'data-fr-opened': 'false',
                            'aria-controls': 'fr-modal-download-word',
                        }}
                        onClick={() => {
                            resetModalContent();
                            if (window.trackEvent)
                                window.trackEvent(
                                    'diagnostic_download_funnel',
                                    'click_button_diagnostic_download_word',
                                    'diagnostic_download_word_button_clicked'
                                );
                        }}
                    />
                </DownloadListItem>
                <DownloadListItem>
                    <Button
                        type="htmx"
                        icon="bi bi-file-earmark-word"
                        label="Rapport triennal local"
                        htmxAttrs={{
                            'data-hx-get': urls.dowloadLocalReport,
                            'data-hx-target': '#diag_word_form',
                            'data-fr-opened': 'false',
                            'aria-controls': 'fr-modal-download-word',
                        }}
                        onClick={() => {
                            resetModalContent();
                            if (window.trackEvent)
                                window.trackEvent(
                                    'diagnostic_download_funnel',
                                    'click_button_local_report_download',
                                    'local_report_download_button_clicked'
                                );
                        }}
                    />
                </DownloadListItem>
                <DownloadListItem>
                    <Button
                        type="link"
                        icon="bi bi-file-earmark-excel"
                        label="Export Excel"
                        url={urls.dowloadCsvReport}
                        onClick={() => {
                            if (window.trackEvent)
                                window.trackEvent(
                                    'diagnostic_download_funnel',
                                    'click_button_diagnostic_download_excel',
                                    'diagnostic_download_excel_success'
                                );
                        }}
                    />
                </DownloadListItem>
            </DownloadList>
        </DownloadContainer>
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
                        {data?.menuItems.map((menu) => (
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
                    {urls && shouldDisplayDownloads && isMobile && (
                        renderDownloadItems()
                    )}
                </NavContainer>
                {urls && shouldDisplayDownloads && !isMobile && (
                    renderDownloadItems()
                )}
            </Container>
        </>
    );
};

export default Navbar;

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useGetCurrentUserQuery } from '@services/api';
import useWindowSize from '@hooks/useWindowSize';
import { buildHeader } from '@utils/projectUrls';
import Header from '@components/layout/Header';
import Button from '@components/ui/Button';
import IconBadge from '@components/ui/IconBadge';
import { theme } from '@theme';

const MOBILE_BREAKPOINT_PX = 980;
const MOBILE_BREAKPOINT = `${MOBILE_BREAKPOINT_PX}px`;
const MOBILE_TABS_HEIGHT = '48px';
const PANEL_WIDTH = '480px';
const TITLE_COLOR = '#000091';

// Contenu du menu latéral : purement descriptif pour l'instant, sans comportement
// Deux contrôles seulement : la zone géographique et la maille affichée sur la carte.
// Le territoire précis se choisit en cliquant sur la carte ou via la barre de recherche.
const ZONES = ['France entière', 'Hexagone', 'Corse', 'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte'];
const ECHELLES = ['Région', 'Département', 'EPCI', 'Commune'];
const LAYERS = [
    "Visualiser la consommation d'ENAF",
    'Visualiser les espaces artificialisés',
    "Visualiser l'artificialisation",
];

const Page = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${theme.colors.backgroundAlt};
`;

// Le panneau et la carte occupent exactement la hauteur restante sous l'en-tête : le panneau
// défile en interne et ses boutons restent visibles en bas. Sur mobile, un seul des deux est
// affiché à la fois, en plein écran, et une barre d'onglets sous l'en-tête permet de basculer.
const Body = styled.div`
    flex: 1;
    display: flex;
    min-height: 0;
`;

const SidePanel = styled.aside<{ $mobileVisible: boolean }>`
    width: ${PANEL_WIDTH};
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: ${theme.colors.background};
    border-right: 1px solid #EEF2F7;

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: ${({ $mobileVisible }) => ($mobileVisible ? 'flex' : 'none')};
        width: 100%;
        border-right: none;
    }
`;

const PanelContent = styled.div`
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: ${theme.spacing.lg} ${theme.spacing.md} 0;
`;

const TipCard = styled.section`
    position: relative;
    background: ${theme.colors.background};
    border-radius: ${theme.radius.default};
    box-shadow: ${theme.shadow.lg};
    padding: 1.25rem 2.5rem 1.25rem ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};
`;

const TipClose = styled.button`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: ${theme.radius.default};
    color: ${theme.colors.textMuted};
    cursor: pointer;

    &:hover {
        background: ${theme.colors.backgroundAlt};
        color: ${theme.colors.text};
    }
`;

const TipTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 ${theme.spacing.sm};
    font-size: ${theme.fontSize.lg};
    font-weight: ${theme.fontWeight.medium};
    color: ${TITLE_COLOR};

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        font-size: ${theme.fontSize.md};
    }
`;

const TipText = styled.p`
    margin: 0 0 ${theme.spacing.sm} 2.75rem;
    font-size: ${theme.fontSize.sm};
    line-height: 1.6;
    color: ${theme.colors.text};

    &:last-child {
        margin-bottom: 0;
    }
`;

const InlineInfoIcon = styled.i`
    color: ${TITLE_COLOR};
    margin: 0 0.2rem;
`;

const Filters = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.lg};
`;

const FilterField = styled.label`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.textMuted};
`;

const FilterSelect = styled.select`
    appearance: none;
    padding: 0.55rem 2rem 0.55rem 0.7rem;
    font-family: inherit;
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.text};
    background: ${theme.colors.backgroundAlt} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23161616' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.7rem center;
    border: none;
    border-bottom: 2px solid ${theme.colors.text};
    border-radius: 0;
    cursor: pointer;
`;

const LayerList = styled.ul`
    list-style: none;
    margin: 0 -${theme.spacing.md};
    padding: 0;
    border-top: 1px solid #EEF2F7;
`;

const LayerItem = styled.li`
    border-bottom: 1px solid #EEF2F7;
`;

const LayerHeader = styled.button<{ $open: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
    width: 100%;
    padding: 1rem ${theme.spacing.md};
    font-family: inherit;
    font-size: ${theme.fontSize.md};
    font-weight: ${theme.fontWeight.medium};
    text-align: left;
    color: ${TITLE_COLOR};
    background: ${({ $open }) => ($open ? theme.colors.primaryBg : 'transparent')};
    border: none;
    cursor: pointer;

    &:hover {
        background: ${theme.colors.backgroundAlt};
    }
`;

const LayerLabel = styled.span`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

const LayerActions = styled.span`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    color: ${TITLE_COLOR};

    .bi-info-circle-fill {
        font-size: 1.3em;
    }
`;

const Chevron = styled.i<{ $open: boolean }>`
    display: inline-block;
    transition: transform 0.2s ease;
    transform: rotate(${({ $open }) => ($open ? '-90deg' : '0deg')});
`;

// Tiroir de la rubrique : accueillera les chiffres clés et la légende
const LayerDrawer = styled.div`
    padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.colors.backgroundSubtle};
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.textMuted};
`;

const PanelFooter = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    border-top: 1px solid #EEF2F7;
    background: ${theme.colors.background};

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        flex-direction: column;
        gap: ${theme.spacing.sm};

        > * {
            width: 100%;
        }
    }
`;

const MapArea = styled.section<{ $mobileVisible: boolean }>`
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.backgroundAlt};

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: ${({ $mobileVisible }) => ($mobileVisible ? 'flex' : 'none')};
    }
`;

// Barre d'onglets mobile, sous l'en-tête : bascule entre la carte et le panneau d'informations.
// Placée dans le flux (et non fixée en bas) pour ne pas être recouverte par la bulle de chat.
const MobileTabs = styled.nav`
    flex-shrink: 0;
    height: ${MOBILE_TABS_HEIGHT};
    display: flex;
    background: ${theme.colors.background};
    border-bottom: 1px solid #EEF2F7;
`;

const MobileTab = styled.button<{ $active: boolean }>`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.medium};
    color: ${({ $active }) => ($active ? TITLE_COLOR : theme.colors.textMuted)};
    background: transparent;
    border: none;
    border-bottom: 3px solid ${({ $active }) => ($active ? TITLE_COLOR : 'transparent')};
    margin-bottom: -1px;
    cursor: pointer;
`;

const MapPlaceholder = styled.p`
    margin: ${theme.spacing.md};
    padding: ${theme.spacing.xl};
    text-align: center;
    border: 2px dashed ${theme.colors.border};
    border-radius: ${theme.radius.default};
    color: ${theme.colors.textMuted};
    font-size: ${theme.fontSize.md};
`;

// La fermeture d'un encart est mémorisée dans le navigateur (pas en base) pour ne pas le réafficher.
// Le paramètre d'URL ?showinfo réaffiche les encarts et oublie leur fermeture.
const TIP_STORAGE_PREFIX = 'carte-nationale:aide-fermee:';
const SHOW_INFO_PARAM = 'showinfo';

const isShowInfoRequested = (): boolean => new URLSearchParams(window.location.search).has(SHOW_INFO_PARAM);

const isTipClosed = (id: string): boolean => {
    try {
        return window.localStorage.getItem(TIP_STORAGE_PREFIX + id) === '1';
    } catch {
        return false;
    }
};

const rememberTipClosed = (id: string): void => {
    try {
        window.localStorage.setItem(TIP_STORAGE_PREFIX + id, '1');
    } catch {
        // Stockage indisponible (navigation privée, quota…) : l'encart réapparaîtra à la prochaine visite
    }
};

const forgetTipClosed = (id: string): void => {
    try {
        window.localStorage.removeItem(TIP_STORAGE_PREFIX + id);
    } catch {
        // Stockage indisponible : rien à oublier
    }
};

interface TipProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

// Encart d'aide que l'utilisateur peut fermer
const Tip: React.FC<TipProps> = ({ id, title, children }) => {
    const [isOpen, setIsOpen] = useState(() => {
        if (isShowInfoRequested()) {
            forgetTipClosed(id);
            return true;
        }
        return !isTipClosed(id);
    });
    if (!isOpen) return null;

    const close = () => {
        setIsOpen(false);
        rememberTipClosed(id);
    };

    return (
        <TipCard>
            <TipClose type="button" onClick={close} aria-label={`Fermer l'aide « ${title} »`}>
                <i className="bi bi-x-lg" aria-hidden="true" />
            </TipClose>
            <TipTitle>
                <IconBadge icon="bi bi-lightbulb" size={32} />
                {title}
            </TipTitle>
            {children}
        </TipCard>
    );
};

const CarteNationale: React.FC = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const [openLayer, setOpenLayer] = useState<string | null>(null);
    const [zone, setZone] = useState(ZONES[0]);
    const [echelle, setEchelle] = useState(ECHELLES[0]);
    const { isMobile } = useWindowSize(MOBILE_BREAKPOINT_PX);
    const [mobileView, setMobileView] = useState<'carte' | 'infos'>('carte');
    const header = useMemo(
        () => buildHeader(currentUser?.is_authenticated ?? false),
        [currentUser?.is_authenticated],
    );

    return (
        <Page>
            <Header header={header} />
            {isMobile && (
                <MobileTabs aria-label="Affichage">
                    <MobileTab type="button" $active={mobileView === 'carte'} aria-pressed={mobileView === 'carte'} onClick={() => setMobileView('carte')}>
                        <i className="bi bi-map" aria-hidden="true" />
                        Carte
                    </MobileTab>
                    <MobileTab type="button" $active={mobileView === 'infos'} aria-pressed={mobileView === 'infos'} onClick={() => setMobileView('infos')}>
                        <i className="bi bi-list-ul" aria-hidden="true" />
                        Informations
                    </MobileTab>
                </MobileTabs>
            )}
            <Body>
                <SidePanel aria-label="Menu de la carte nationale" $mobileVisible={mobileView === 'infos'}>
                    <PanelContent>
                        <Tip id="pour-commencer" title="Pour commencer">
                            <TipText>
                                Sélectionnez votre territoire avec les filtres ou cliquez sur la carte interactive
                            </TipText>
                        </Tip>

                        <Filters role="group" aria-label="Filtres de territoire">
                            <FilterField>
                                Zone
                                <FilterSelect value={zone} onChange={(e) => setZone(e.target.value)}>
                                    {ZONES.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </FilterSelect>
                            </FilterField>
                            <FilterField>
                                Échelle
                                <FilterSelect value={echelle} onChange={(e) => setEchelle(e.target.value)}>
                                    {ECHELLES.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </FilterSelect>
                            </FilterField>
                        </Filters>

                        <Tip id="pour-visualiser" title="Pour visualiser les données">
                            <TipText>
                                Cliquez sur les rubriques pour faire apparaître les données sur la carte et afficher les chiffres clés et la légende
                            </TipText>
                            <TipText>
                                Cliquez sur l'icône
                                <InlineInfoIcon className="bi bi-info-circle-fill" aria-label="information" />
                                pour afficher les détails de la donnée
                            </TipText>
                        </Tip>

                        <LayerList>
                            {LAYERS.map((label) => {
                                const isOpen = openLayer === label;
                                return (
                                    <LayerItem key={label}>
                                        <LayerHeader
                                            type="button"
                                            $open={isOpen}
                                            aria-expanded={isOpen}
                                            onClick={() => setOpenLayer(isOpen ? null : label)}
                                        >
                                            <LayerLabel>
                                                <i className="bi bi-list" aria-hidden="true" />
                                                {label}
                                            </LayerLabel>
                                            <LayerActions>
                                                <i className="bi bi-info-circle-fill" aria-hidden="true" />
                                                <Chevron className="bi bi-chevron-left" aria-hidden="true" $open={isOpen} />
                                            </LayerActions>
                                        </LayerHeader>
                                        {isOpen && (
                                            <LayerDrawer>
                                                Chiffres clés et légende à venir.
                                            </LayerDrawer>
                                        )}
                                    </LayerItem>
                                );
                            })}
                        </LayerList>
                    </PanelContent>

                    <PanelFooter>
                        <Button type="button" icon="bi bi-download" iconPosition="right">
                            Exporter la carte
                        </Button>
                        <Button type="button" icon="bi bi-bar-chart-fill" iconPosition="right">
                            Voir le diagnostic de mon territoire
                        </Button>
                    </PanelFooter>
                </SidePanel>

                <MapArea aria-label="Carte interactive" $mobileVisible={mobileView === 'carte'}>
                    <MapPlaceholder>Emplacement de la carte interactive</MapPlaceholder>
                </MapArea>
            </Body>
        </Page>
    );
};

export default CarteNationale;

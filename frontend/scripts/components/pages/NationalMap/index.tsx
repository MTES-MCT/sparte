import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import useWindowSize from '@hooks/useWindowSize';
import Button from '@components/ui/Button';
import NationalMapChart, { NationalMapChartHandle } from './NationalMapChart';
import Brand from './components/Brand';
import MillesimeBadge from './components/MillesimeBadge';
import { MillesimeExplanationHost, useExplainedFrame } from './components/MillesimeExplanation';
import Breadcrumb from './Breadcrumb';
import Controls from './Controls';
import ConsoCharts, { usePrefetchConsoCharts } from './ConsoCharts';
import LayerMenu from './LayerMenu';
import { ChartsDockContext } from './IndicatorList';
import Tip from './Tip';
import { CONSO_INDICATORS, DEFAULT_INDICATOR, withEndYear } from './indicators';
import { findArtifIndicator } from './artifIndicators';
import { availableScales, diagnosticUrl, landToZone, zoneLabel, zoneToLand } from './zones';
import { zoneHeading } from './domain/frame/base';
import { createLandHighlight } from './domain/landHighlight';
import { presetPeriodsOf } from './domain/presetPeriods';
import { ARTIF_LAYERS, DEFAULT_END_YEAR, DEFAULT_START_YEAR } from './domain/viewState';
import { useDisplayedFrame, useEngineWarmup, useMapSources, useViewState } from './hooks';
import {
    MENU_ACTIVE_BORDER,
    MENU_ACTIVE_COLOR,
    MENU_COLOR,
    MOBILE_BREAKPOINT,
    MOBILE_BREAKPOINT_PX,
    PAGE_BACKGROUND,
    PANEL_BORDER_COLOR,
    STACKED_TITLE_BAR_HEIGHT,
    STACK_BREAKPOINT,
    TITLE_BAR_HEIGHT,
} from './layoutStyles';
import { theme } from '@theme';

const MOBILE_TABS_HEIGHT = '48px';
// Largeur du menu latéral des diagnostics, un peu élargie pour les libellés des indicateurs
const PANEL_WIDTH = '320px';

const EXPORT_TITLE = 'Télécharger la carte affichée en PNG';
// La carte de toutes les communes du pays n'a pas encore d'image de taille fixe à télécharger

// Mise en page des diagnostics, sans leur en-tête : menu latéral blanc, barre de titre, contenu sur
// fond bleuté. La marque du site est en haut du menu, pour que la carte dispose de toute la hauteur
// de la fenêtre. Le menu et le contenu occupent exactement cette hauteur et défilent chacun en
// interne. Sur mobile, un seul des deux est affiché à la fois, sous une barre qui porte le logo
// et les onglets pour basculer.
const Page = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${PAGE_BACKGROUND};
`;

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
    border-right: 1px solid ${PANEL_BORDER_COLOR};

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: ${({ $mobileVisible }) => ($mobileVisible ? 'flex' : 'none')};
        width: 100%;
        border-right: none;
    }
`;

// Marque en haut du menu, à la hauteur de la barre de titre : leurs filets se prolongent
const PanelBrand = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: ${TITLE_BAR_HEIGHT};
    padding: 0 ${theme.spacing.md};
    border-bottom: 1px solid ${theme.colors.border};
`;

const PanelScroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
`;

// Pied du menu réservé aux graphiques complémentaires de la carte choisie, au-dessus des boutons :
// il ne défile pas avec la liste des cartes. Sa hauteur est plafonnée ; au-delà, il défile lui-même.
const ChartsDock = styled.div`
    flex-shrink: 0;
    max-height: min(35vh, 13rem);
    overflow-y: auto;
    border-top: 1px solid ${PANEL_BORDER_COLOR};

    &:empty {
        display: none;
    }
`;

const PanelBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.sm};
`;

const PanelFooter = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    border-top: 1px solid ${PANEL_BORDER_COLOR};

    > * {
        width: 100%;
    }

    /* Téléphone en paysage : les deux boutons côte à côte, pour laisser la hauteur au menu */
    @media (max-width: ${MOBILE_BREAKPOINT}) and (orientation: landscape) {
        flex-direction: row;

        > * {
            flex: 1;
            width: auto;
        }
    }
`;

// Sur grand écran la carte occupe la hauteur et seule sa colonne de droite défile ;
// sur les écrans plus étroits la colonne passe sous la carte et tout le contenu défile
const Main = styled.main<{ $mobileVisible: boolean }>`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (max-width: ${STACK_BREAKPOINT}) {
        overflow-y: auto;
    }

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: ${({ $mobileVisible }) => ($mobileVisible ? 'flex' : 'none')};
    }
`;

// Barre de titre des diagnostics : le fil d'Ariane sur une petite ligne, puis le nom du territoire
// à gauche et les contrôles à droite. Sa hauteur est fixe : un nom long, un chemin plus profond ou
// une autre rubrique ne déplacent pas le contenu de la page. Le titre et les commandes partagent
// une ligne quand la colonne est à côté de la carte, où la hauteur est comptée ; ils en ont
// chacun une quand elle passe dessous, où les commandes prennent presque toute la largeur.
// Le flou d'arrière-plan enferme la liste des années dans le contexte d'empilement de la barre :
// celle-ci passe au-dessus du contenu, sans quoi les chiffres clés recouvrent la liste.
const TopBar = styled.div`
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: ${TITLE_BAR_HEIGHT};
    padding: 0 ${theme.spacing.lg};
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid ${theme.colors.border};
    backdrop-filter: blur(8px);

    @media (max-width: ${STACK_BREAKPOINT}) {
        height: ${STACKED_TITLE_BAR_HEIGHT};
    }

    /* Téléphone : le titre seul, sur autant de lignes qu'il lui en faut */
    @media (max-width: ${MOBILE_BREAKPOINT}) {
        height: auto;
        padding: 0.75rem ${theme.spacing.md};
    }
`;

const TopBarRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};

    @media (max-width: ${STACK_BREAKPOINT}) {
        flex-direction: column;
        align-items: stretch;
        gap: ${theme.spacing.sm};
    }
`;

const TopBarLeft = styled.div`
    flex: 1 1 0;
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    min-width: 0;

    @media (max-width: ${STACK_BREAKPOINT}) {
        flex: none;
    }

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        flex-wrap: wrap;
    }
`;

// Un nom trop long pour sa ligne est coupé : il reste lisible en entier au survol et dans le fil d'Ariane
const Title = styled.div`
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${theme.fontSize.xxl};
    line-height: 1.2em;
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.purple};

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        overflow: visible;
        white-space: normal;
    }
`;

// Les commandes gardent leur largeur ; sur deux lignes, elles tiennent dans celle de la barre
const TopBarRight = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;

    @media (max-width: ${STACK_BREAKPOINT}) {
        min-width: 0;
    }
`;

const TypeLabel = styled.span`
    flex-shrink: 0;
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.medium};
    color: ${theme.colors.textMuted};
    white-space: nowrap;
`;

const Content = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg};

    @media (max-width: ${STACK_BREAKPOINT}) {
        flex: none;
    }

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        padding: 0.75rem ${theme.spacing.md} ${theme.spacing.md};
    }
`;

// Barre mobile, en haut de la page : le logo du site, puis les onglets qui basculent entre la carte
// et le panneau d'informations. Placée dans le flux (et non fixée en bas) pour ne pas être
// recouverte par la bulle de chat.
const MobileBar = styled.div`
    flex-shrink: 0;
    height: ${MOBILE_TABS_HEIGHT};
    display: flex;
    align-items: stretch;
    gap: ${theme.spacing.sm};
    padding-left: ${theme.spacing.md};
    background: ${theme.colors.background};
    border-bottom: 1px solid ${PANEL_BORDER_COLOR};
`;

const MobileTabs = styled.nav`
    flex: 1;
    min-width: 0;
    display: flex;
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
    color: ${({ $active }) => ($active ? MENU_ACTIVE_COLOR : MENU_COLOR)};
    background: transparent;
    border: none;
    border-bottom: 3px solid ${({ $active }) => ($active ? MENU_ACTIVE_BORDER : 'transparent')};
    margin-bottom: -1px;
    cursor: pointer;
`;

const NationalMap: React.FC = () => {
    const { state, actions } = useViewState();
    const { zone, scale, startYear, endYear, indicatorId } = state.request;
    const { changeZone, rememberNames, clampPeriod } = actions;
    // Le hook tient pour mobile une fenêtre strictement plus étroite que la largeur reçue ; les
    // règles CSS de la page valent jusqu'à MOBILE_BREAKPOINT compris
    const { isMobile } = useWindowSize(MOBILE_BREAKPOINT_PX + 1);
    const [mobileView, setMobileView] = useState<'map' | 'infos'>('map');
    const mapRef = useRef<NationalMapChartHandle>(null);
    // Élément du pied du menu, donné à la liste des cartes qui y range ses graphiques
    const [chartsDock, setChartsDock] = useState<HTMLDivElement | null>(null);
    // La carte et le nuage de points d'une carte bivariée se désignent le territoire survolé
    const [highlight] = useState(createLandHighlight);

    // Carte d'artificialisation (OCS GE) demandée, s'il y en a une
    const artifIndicator = findArtifIndicator(indicatorId);
    // Avant les requêtes de la vue : l'adresse des tuiles part la première, et n'attend pas leurs
    // réponses sur un serveur qui les traite l'une après l'autre
    useEngineWarmup(state.request);
    const sources = useMapSources(state.request);
    // Années disponibles et périodes de référence : lues dans la dernière réponse reçue, pour que
    // le sélecteur de période et les libellés ne clignotent pas pendant un chargement
    const years = sources.conso.latest?.years;
    const requestedParent = sources.base.current?.parent;

    useEffect(() => {
        if (!requestedParent) return;
        rememberNames(Object.fromEntries([requestedParent, ...requestedParent.ancestors].map((land) => [landToZone(land), land.name])));
    }, [requestedParent, rememberNames]);

    // Resserre la période sur les années réellement disponibles
    useEffect(() => {
        if (years) clampPeriod(years);
    }, [years, startYear, endYear, clampPeriod]);

    // Libellés avec l'année du dernier millésime connu
    const indicatorsWithYears = useMemo(() => withEndYear(CONSO_INDICATORS, years?.max), [years?.max]);
    const indicator =
        artifIndicator ??
        indicatorsWithYears.find((i) => i.id === indicatorId && i.type !== 'chart') ??
        indicatorsWithYears.find((i) => i.id === DEFAULT_INDICATOR.id);

    // Tout ce qui décrit la carte (titre, fil d'Ariane, carte, légende, chiffres clés, note, graphiques)
    // lit la vue affichée ; les commandes, le menu et le bouton du diagnostic lisent la vue demandée
    const { frame, staged, pending, error, confirmPainted } = useDisplayedFrame(state.request, indicator, sources);
    useExplainedFrame(frame);
    const heading = frame?.base ?? zoneHeading(zone, null, state.names);
    const requestedName = zoneLabel(zone, requestedParent, state.names);
    const shownCharts = (frame?.indicator.charts ?? []).filter((id) => state.activeCharts.includes(id));
    // Les graphiques de la vue demandée sont chargés en même temps que sa carte
    const requestedCharts = useMemo(() => (indicator.charts ?? []).filter((id) => state.activeCharts.includes(id)), [indicator, state.activeCharts]);
    usePrefetchConsoCharts(zone, startYear, endYear, requestedCharts);
    const scales = availableScales(zone);
    const exportable = frame !== null;

    // En ligne dans la barre de titre sur grand écran, en haut du panneau d'informations sur mobile
    const controls = (
        <Controls
            layout={isMobile ? 'stack' : 'bar'}
            zone={zone}
            scale={scale}
            scales={scales}
            startYear={startYear}
            endYear={endYear}
            minYear={years?.min ?? DEFAULT_START_YEAR}
            maxYear={years?.max ?? DEFAULT_END_YEAR}
            presetPeriods={presetPeriodsOf(sources.conso.latest?.fixed_periods)}
            currentName={requestedParent?.name ?? state.names[zone]}
            millesimes={artifIndicator ? <MillesimeBadge layout={isMobile ? 'stack' : 'bar'} reading={frame?.millesimes ?? null} /> : undefined}
            onZoneChange={changeZone}
            onScaleChange={actions.changeScale}
            onStartYearChange={actions.setStartYear}
            onEndYearChange={actions.setEndYear}
            onPeriodChange={actions.setPeriod}
        />
    );

    return (
        <Page>
            {isMobile && (
                <MobileBar>
                    <Brand compact />
                    <MobileTabs aria-label="Affichage">
                        <MobileTab type="button" $active={mobileView === 'map'} aria-pressed={mobileView === 'map'} onClick={() => setMobileView('map')}>
                            <i className="bi bi-map" aria-hidden="true" />
                            <span>Carte</span>
                        </MobileTab>
                        <MobileTab type="button" $active={mobileView === 'infos'} aria-pressed={mobileView === 'infos'} onClick={() => setMobileView('infos')}>
                            <i className="bi bi-list-ul" aria-hidden="true" />
                            <span>Informations</span>
                        </MobileTab>
                    </MobileTabs>
                </MobileBar>
            )}
            <Body>
                <SidePanel aria-label="Menu de la carte nationale" $mobileVisible={mobileView === 'infos'}>
                    {!isMobile && (
                        <PanelBrand>
                            <Brand />
                        </PanelBrand>
                    )}
                    <PanelScroll>
                        <PanelBlock>
                            {isMobile && controls}
                            <Tip id="getting-started" title="Pour commencer">
                                <p>Sélectionnez votre territoire avec les filtres ou cliquez sur la carte interactive.</p>
                            </Tip>
                            <Tip id="visualizing" title="Pour visualiser les données">
                                <p>Cliquez sur les rubriques pour faire apparaître les données sur la carte et afficher les chiffres clés et la légende.</p>
                                <p>
                                    Cliquez sur l'icône{' '}
                                    <i className="bi bi-info-circle" aria-label="information" />
                                    {' '}pour afficher les détails de la donnée.
                                </p>
                            </Tip>
                        </PanelBlock>
                        <ChartsDockContext.Provider value={chartsDock}>
                            <LayerMenu
                                openLayer={state.openRubrique}
                                onToggleLayer={actions.toggleRubrique}
                                indicators={indicatorsWithYears}
                                layerIndicators={ARTIF_LAYERS}
                                selected={indicatorId}
                                view={state.request}
                                onSelectLine={actions.selectLine}
                                onSelect={actions.selectIndicator}
                                activeCharts={state.activeCharts}
                                onToggleChart={actions.toggleChart}
                            />
                        </ChartsDockContext.Provider>
                    </PanelScroll>
                    <ChartsDock ref={setChartsDock} />
                    <PanelFooter>
                        <Button
                            type="button"
                            icon="bi bi-download"
                            iconPosition="right"
                            disabled={!exportable}
                            title={EXPORT_TITLE}
                            onClick={() => mapRef.current?.exportPng()}
                        >
                            Exporter la carte
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            icon="bi bi-bar-chart-fill"
                            iconPosition="right"
                            title={`Ouvrir le diagnostic : ${zoneToLand(zone) ? requestedName : 'France entière'}`}
                            onClick={() => window.location.assign(diagnosticUrl(zone))}
                        >
                            Voir le diagnostic de mon territoire
                        </Button>
                    </PanelFooter>
                </SidePanel>

                <Main $mobileVisible={mobileView === 'map'}>
                    <TopBar>
                        {!isMobile && <Breadcrumb inBar path={heading.path} onZoneChange={changeZone} />}
                        <TopBarRow>
                            <TopBarLeft>
                                <Title role="heading" aria-level={1} title={heading.title}>
                                    {heading.title}
                                </Title>
                                {heading.typeLabel && <TypeLabel>{heading.typeLabel}</TypeLabel>}
                            </TopBarLeft>
                            {!isMobile && <TopBarRight>{controls}</TopBarRight>}
                        </TopBarRow>
                    </TopBar>
                    <Content>
                        {/* Sous les onglets mobiles, la barre ne porte que le titre : le fil d'Ariane reste au-dessus de la carte */}
                        {isMobile && <Breadcrumb path={heading.path} onZoneChange={changeZone} />}
                        <NationalMapChart
                            ref={mapRef}
                            frame={frame}
                            staged={staged}
                            pending={pending}
                            error={error}
                            targetName={requestedName}
                            onZoneChange={changeZone}
                            onStagedPainted={confirmPainted}
                            highlight={highlight}
                        >
                            {frame && (
                                <ConsoCharts
                                    zone={frame.base.zone}
                                    land={frame.chartsLand}
                                    period={frame.period}
                                    shownOcsge={frame.shownOcsge}
                                    scatter={frame.scatter}
                                    highlight={highlight}
                                    charts={shownCharts}
                                />
                            )}
                        </NationalMapChart>
                    </Content>
                </Main>
            </Body>
        </Page>
    );
};

// L'explication des millésimes de l'OCS GE (tiroir des diagnostics) entoure la page : ses renvois
// sont dans la barre de titre, dans le panneau mobile et sous les chiffres clés
const NationalMapWithExplanation: React.FC = () => (
    <MillesimeExplanationHost>
        <NationalMap />
    </MillesimeExplanationHost>
);

export default NationalMapWithExplanation;

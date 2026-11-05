import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useGetCurrentUserQuery, useGetNationalMapBaseMapQuery, useGetNationalMapIndicatorsQuery } from '@services/api';
import useWindowSize from '@hooks/useWindowSize';
import { buildHeader } from '@utils/projectUrls';
import { getLandTypeLabel } from '@utils/landUtils';
import Header from '@components/layout/Header';
import Button from '@components/ui/Button';
import NationalMapChart, { NationalMapChartHandle } from './NationalMapChart';
import Breadcrumb from './Breadcrumb';
import Controls from './Controls';
import KeyFigures from './KeyFigures';
import ConsoCharts from './ConsoCharts';
import LayerMenu, { LAYERS } from './LayerMenu';
import Tip from './Tip';
import { CONSO_INDICATORS, DEFAULT_INDICATOR, MAP_INDICATORS, withEndYear } from './indicators';
import { ZONE_FRANCE, availableScales, defaultScale, diagnosticUrl, filterByZone, isValidZone, zoneLabel, zoneToLand } from './zones';
import {
    MENU_ACTIVE_BORDER,
    MENU_ACTIVE_COLOR,
    MENU_COLOR,
    MOBILE_BREAKPOINT,
    MOBILE_BREAKPOINT_PX,
    PAGE_BACKGROUND,
    PANEL_BORDER_COLOR,
    STACK_BREAKPOINT,
} from './layoutStyles';
import { theme } from '@theme';

const MOBILE_TABS_HEIGHT = '48px';
// Largeur du menu latéral des diagnostics, un peu élargie pour les libellés des indicateurs
const PANEL_WIDTH = '320px';

// Période par défaut, resserrée sur les années disponibles dès que l'API répond
const DEFAULT_START_YEAR = 2011;
const DEFAULT_END_YEAR = 2024;

// Paramètres d'URL qui décrivent la vue, pour la rouvrir à l'identique
const URL_PARAMS = { zone: 'zone', scale: 'scale', startYear: 'start', endYear: 'end', indicator: 'indicator' };

// Mise en page des diagnostics : en-tête, menu latéral blanc, barre de titre, contenu sur fond bleuté.
// Le menu et le contenu occupent exactement la hauteur restante sous l'en-tête et défilent chacun
// en interne. Sur mobile, un seul des deux est affiché à la fois et une barre d'onglets sous
// l'en-tête permet de basculer.
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

const PanelScroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
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

// Barre de titre des diagnostics : nom du territoire à gauche, contrôles à droite
const TopBar = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm} ${theme.spacing.md};
    min-height: 4.6rem;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid ${theme.colors.border};
    backdrop-filter: blur(8px);

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        min-height: 0;
        padding: 0.75rem ${theme.spacing.md};
    }
`;

const TopBarLeft = styled.div`
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.75rem;
    min-width: 0;
`;

const Title = styled.div`
    min-width: 0;
    font-size: ${theme.fontSize.xxl};
    line-height: 1.2em;
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.purple};
`;

const TopBarRight = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
    min-width: 0;
`;

const TypeLabel = styled.span`
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

// Barre d'onglets mobile, sous l'en-tête : bascule entre la carte et le panneau d'informations.
// Placée dans le flux (et non fixée en bas) pour ne pas être recouverte par la bulle de chat.
const MobileTabs = styled.nav`
    flex-shrink: 0;
    height: ${MOBILE_TABS_HEIGHT};
    display: flex;
    background: ${theme.colors.background};
    border-bottom: 1px solid ${PANEL_BORDER_COLOR};
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

// État initial lu dans l'URL, avec des valeurs sûres si un paramètre est absent ou invalide
const readInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const zoneParam = params.get(URL_PARAMS.zone);
    const zone = zoneParam && isValidZone(zoneParam) ? zoneParam : ZONE_FRANCE;
    const scaleParam = params.get(URL_PARAMS.scale);
    const scale = scaleParam && availableScales(zone).includes(scaleParam) ? scaleParam : defaultScale(zone);
    const year = (key: string, fallback: number) => {
        const value = Number(params.get(key));
        return Number.isInteger(value) && value > 1900 ? value : fallback;
    };
    const startYear = year(URL_PARAMS.startYear, DEFAULT_START_YEAR);
    const endYear = Math.max(startYear, year(URL_PARAMS.endYear, DEFAULT_END_YEAR));
    const indicatorParam = params.get(URL_PARAMS.indicator);
    const indicator = MAP_INDICATORS.some((i) => i.id === indicatorParam) ? (indicatorParam as string) : DEFAULT_INDICATOR.id;
    return { zone, scale, startYear, endYear, indicator };
};

const NationalMap: React.FC = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const [initial] = useState(readInitialState);
    // Une seule rubrique dépliée à la fois ; celle de la consommation l'est par défaut
    const [openLayer, setOpenLayer] = useState<string | null>(LAYERS[0]);
    // Indicateur de consommation affiché sur la carte, et graphiques affichés en complément
    const [consoIndicator, setConsoIndicator] = useState(initial.indicator);
    const [consoCharts, setConsoCharts] = useState<string[]>(CONSO_INDICATORS.filter((i) => i.type === 'chart').map((i) => i.id));
    const toggleConsoChart = (id: string) =>
        setConsoCharts((active) => (active.includes(id) ? active.filter((c) => c !== id) : [...active, id]));
    const [zone, setZone] = useState(initial.zone);
    const [scale, setScale] = useState(initial.scale);
    const [startYear, setStartYear] = useState(initial.startYear);
    const [endYear, setEndYear] = useState(initial.endYear);
    const { isMobile } = useWindowSize(MOBILE_BREAKPOINT_PX);
    const [mobileView, setMobileView] = useState<'map' | 'infos'>('map');
    const mapRef = useRef<NationalMapChartHandle>(null);
    const header = useMemo(
        () => buildHeader(currentUser?.is_authenticated ?? false),
        [currentUser?.is_authenticated],
    );

    // Changer de zone remet la maille juste en dessous si celle en cours n'est plus affichable
    const changeZone = useCallback((nextZone: string) => {
        setZone(nextZone);
        setScale((current) => (availableScales(nextZone).includes(current) ? current : defaultScale(nextZone)));
    }, []);

    // L'URL reflète la vue pour pouvoir la rouvrir ou la partager à l'identique
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set(URL_PARAMS.zone, zone);
        params.set(URL_PARAMS.scale, scale);
        params.set(URL_PARAMS.startYear, String(startYear));
        params.set(URL_PARAMS.endYear, String(endYear));
        params.set(URL_PARAMS.indicator, consoIndicator);
        window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
    }, [zone, scale, startYear, endYear, consoIndicator]);

    const parentLand = zoneToLand(zone);
    const query = parentLand ? { scale, parent_type: parentLand.land_type, parent_id: parentLand.land_id } : { scale };
    const baseMap = useGetNationalMapBaseMapQuery(query);
    const indicators = useGetNationalMapIndicatorsQuery({ ...query, start_year: startYear, end_year: endYear });
    const years = indicators.data?.years;
    const parent = baseMap.data?.parent;

    // Resserre la période sur les années réellement disponibles
    useEffect(() => {
        if (!years) return;
        if (endYear > years.max) setEndYear(years.max);
        if (startYear < years.min) setStartYear(years.min);
    }, [years, startYear, endYear]);

    const features = useMemo(
        () => (baseMap.data ? filterByZone(baseMap.data.geojson.features, zone) : []),
        [baseMap.data, zone],
    );
    // Libellés avec l'année du dernier millésime connu
    const indicatorsWithYears = useMemo(() => withEndYear(CONSO_INDICATORS, years?.max), [years?.max]);
    const indicator = indicatorsWithYears.find((i) => i.id === consoIndicator && i.type !== 'chart') ?? withEndYear([DEFAULT_INDICATOR], years?.max)[0];
    const shownLands = useMemo(
        () =>
            indicators.data
                ? features.map((f) => indicators.data!.lands[f.properties.land_id]).filter((land) => land !== undefined)
                : [],
        [features, indicators.data],
    );
    const shownCharts = (indicator.charts ?? []).filter((id) => consoCharts.includes(id));
    const scales = availableScales(zone);
    const typeLabel = parentLand ? getLandTypeLabel(parentLand.land_type) : '';
    const title = zoneLabel(zone, parent);

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
            currentName={parent?.name}
            onZoneChange={changeZone}
            onScaleChange={setScale}
            onStartYearChange={setStartYear}
            onEndYearChange={setEndYear}
        />
    );

    return (
        <Page>
            <Header header={header} />
            {isMobile && (
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
            )}
            <Body>
                <SidePanel aria-label="Menu de la carte nationale" $mobileVisible={mobileView === 'infos'}>
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
                        <LayerMenu
                            openLayer={openLayer}
                            onToggleLayer={(label) => setOpenLayer((current) => (current === label ? null : label))}
                            indicators={indicatorsWithYears}
                            selected={consoIndicator}
                            onSelect={setConsoIndicator}
                            activeCharts={consoCharts}
                            onToggleChart={toggleConsoChart}
                        />
                    </PanelScroll>
                    <PanelFooter>
                        <Button
                            type="button"
                            icon="bi bi-download"
                            iconPosition="right"
                            disabled={!baseMap.data}
                            title="Télécharger la carte affichée en PNG"
                            onClick={() => mapRef.current?.exportPng()}
                        >
                            Exporter la carte
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            icon="bi bi-bar-chart-fill"
                            iconPosition="right"
                            title={`Ouvrir le diagnostic : ${parentLand ? title : 'France entière'}`}
                            onClick={() => window.location.assign(diagnosticUrl(zone))}
                        >
                            Voir le diagnostic de mon territoire
                        </Button>
                    </PanelFooter>
                </SidePanel>

                <Main $mobileVisible={mobileView === 'map'}>
                    <TopBar>
                        <TopBarLeft>
                            <Title role="heading" aria-level={1}>
                                {title}
                            </Title>
                            {typeLabel && <TypeLabel>{typeLabel}</TypeLabel>}
                        </TopBarLeft>
                        {!isMobile && <TopBarRight>{controls}</TopBarRight>}
                    </TopBar>
                    <Content>
                        <Breadcrumb zone={zone} parent={parent} onZoneChange={changeZone} />
                        <NationalMapChart
                            ref={mapRef}
                            baseMap={baseMap.data}
                            features={features}
                            zone={zone}
                            scale={scale}
                            indicator={indicator}
                            data={indicators.data}
                            loading={baseMap.isFetching || indicators.isFetching}
                            error={baseMap.isError}
                            onZoneChange={changeZone}
                            keyFigures={indicators.data ? <KeyFigures lands={shownLands} startYear={startYear} endYear={endYear} /> : undefined}
                        >
                            <ConsoCharts zone={zone} startYear={startYear} endYear={endYear} charts={shownCharts} />
                        </NationalMapChart>
                    </Content>
                </Main>
            </Body>
        </Page>
    );
};

export default NationalMap;

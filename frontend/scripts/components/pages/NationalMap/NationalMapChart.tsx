import React, { ReactNode, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsOfflineExporting from 'highcharts/modules/offline-exporting';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';
import { BivariateLegend } from '@components/charts/consommation/BivariateMap/BivariateLegend';
import { downloadChartPng } from '@components/charts/downloadChartPng';
import type { NationalMapBaseMap, NationalMapBivariateMeta, NationalMapBivariateValue, NationalMapFeature, NationalMapIndicators } from '@services/api';
import { formatNumber } from '@utils/formatUtils';
import { getLandTypeLabel } from '@utils/landUtils';
import { SCALE_LABELS, ZONE_FRANCE, landToZone, zoneLabel } from './zones';
import { Indicator, UNIT_LABELS } from './indicators';
import ClassLegend, { HoveredLand } from './ClassLegend';
import { DIVERGING_PALETTE, NO_DATA_COLOR, SEQUENTIAL_PALETTE, ValueClass, formatValue, naturalBreaksClasses, periodLabel } from './values';
import { STACK_BREAKPOINT } from './layoutStyles';

HighchartsMap(Highcharts);
HighchartsAccessibility(Highcharts);
HighchartsExporting(Highcharts);
HighchartsOfflineExporting(Highcharts);

const TERRITORY_COLOR = '#000091';
const SEPARATION_COLOR = '#8f8fb8';
// Colonne à droite de la carte : chiffres clés, légende puis graphiques complémentaires
const ASIDE_WIDTH = '400px';
// Opacité des territoires hors de la classe survolée dans la légende
const DIMMED_OPACITY = 0.2;

// Collectivités françaises absentes des données de consommation d'espaces (et donc de la carte)
const COLLECTIVITIES_OFF_MAP =
    'Saint-Pierre-et-Miquelon, Saint-Barthélemy, Saint-Martin, Wallis-et-Futuna, ' +
    'la Polynésie française, la Nouvelle-Calédonie et les Terres australes et antarctiques françaises';

// Sur grand écran : la carte dans une carte blanche à gauche, sur toute la hauteur, et une
// colonne à droite (chiffres clés, légende, graphiques) qui défile seule. Sur les écrans
// plus étroits : la colonne passe sous la carte, qui garde une hauteur minimale.
const Row = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    gap: ${theme.spacing.md};

    @media (max-width: ${STACK_BREAKPOINT}) {
        flex: none;
        flex-direction: column;
    }
`;

const MapCard = styled(BaseCard)`
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;

    @media (max-width: ${STACK_BREAKPOINT}) {
        flex: none;
    }
`;

// Le conteneur Highcharts est positionné en absolu pour hériter d'une hauteur définie
const Canvas = styled.div`
    flex: 1;
    min-height: 0;
    position: relative;

    @media (max-width: ${STACK_BREAKPOINT}) {
        min-height: 60vh;
    }

    > .national-map-canvas {
        position: absolute;
        inset: 0;
    }
`;

const Aside = styled.aside`
    width: ${ASIDE_WIDTH};
    flex-shrink: 0;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    /* Laisse l'ombre de la dernière carte visible */
    padding-bottom: ${theme.spacing.md};

    @media (max-width: ${STACK_BREAKPOINT}) {
        width: auto;
        overflow: visible;
        padding-bottom: 0;
    }
`;

const Message = styled.p`
    margin: auto;
    color: ${theme.colors.textMuted};
    font-size: ${theme.fontSize.md};
`;

const Banner = styled.p`
    position: absolute;
    top: ${theme.spacing.md};
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    margin: 0;
    padding: 0.5rem 0.9rem;
    max-width: 80%;
    background: ${theme.colors.warningBg};
    border: 1px solid ${theme.colors.warningBorder};
    border-radius: ${theme.radius.default};
    color: ${theme.colors.warning};
    font-size: ${theme.fontSize.sm};
`;

const Legend = styled.div`
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.text};
`;

// Pied de la carte, comme le pied des cartes de graphique des diagnostics
const Footnote = styled.p`
    margin: 0;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.fontSize.xs};
    line-height: 1.5;
    color: ${theme.colors.textMuted};
    border-top: 1px solid ${theme.colors.border};
    background: ${theme.colors.backgroundSubtle};
`;

// Phrase sous la carte : territoires affichés sans données, et, sur la France entière,
// collectivités absentes de la carte. Rien à dire : null.
const missingDataSentence = (names: string[], wholeFrance: boolean): string | null => {
    const intro = "Les données de consommation d'espaces ne sont pas disponibles pour";
    const shown = names.length > 0 ? `${names.join(', ')} (en gris sur la carte)` : '';
    if (!wholeFrance) return shown ? `${intro} ${shown}.` : null;
    const offMap = `${COLLECTIVITIES_OFF_MAP}, qui ne figurent pas sur la carte.`;
    return shown ? `${intro} ${shown}, ni pour ${offMap}` : `${intro} ${offMap}`;
};

const percent = (v: number | null | undefined, decimals = 2) =>
    v === null || v === undefined ? 'n.d.' : `${formatNumber({ number: v, decimals })} %`;

// Taux des cartes bivariées : des pourcentages par an souvent très petits, affichés avec juste assez de décimales
const rateDecimals = (v: number): number => {
    if (Math.abs(v) < 0.01) return 4;
    if (Math.abs(v) < 0.1) return 3;
    return 2;
};

const formatRate = (v: number): string => Number.parseFloat(v.toFixed(rateDecimals(v))).toString().replace('.', ',');

const formatIndicatorRate = (v: number, unit: string): string => (unit === '%' && v > 0 ? `+${formatRate(v)}` : formatRate(v));

type Extremes = { min: number | null; max: number | null };

const extremes = (values: (number | null)[]): Extremes => {
    const present = values.filter((v): v is number => v !== null && v !== undefined);
    return present.length > 0 ? { min: Math.min(...present), max: Math.max(...present) } : { min: null, max: null };
};

// Props de la légende bivariée des diagnostics : seuils nationaux de la maille et bornes des territoires affichés
const bivariateLegendProps = (meta: NationalMapBivariateMeta, scale: string, conso: Extremes, indic: Extremes) => {
    const [consoT1, consoT2] = meta.conso_thresholds ?? [null, null];
    const [indicT1, indicT2] = meta.indic_thresholds ?? [null, null];
    const unit = meta.indicator_unit;
    const consoMin = conso.min === null ? '0' : formatRate(conso.min);
    const consoMax = conso.max === null ? '∞' : formatRate(conso.max);
    const indicMin = indic.min === null ? '−∞' : formatIndicatorRate(indic.min, unit);
    const indicMax = indic.max === null ? '+∞' : formatIndicatorRate(indic.max, unit);
    return {
        colorGrid: [0, 1, 2].map((row) => meta.palette.slice(row * 3, row * 3 + 3)),
        consoLabel: meta.conso_label,
        consoRanges:
            consoT1 !== null && consoT2 !== null
                ? [`[${consoMin}, ${formatRate(consoT1)}]`, `]${formatRate(consoT1)}, ${formatRate(consoT2)}]`, `]${formatRate(consoT2)}, ${consoMax}]`]
                : null,
        indicName: meta.indicator_label,
        indicUnit: unit,
        indicRanges:
            indicT1 !== null && indicT2 !== null
                ? [
                      `[${indicMin}, ${formatIndicatorRate(indicT1, unit)}]`,
                      `]${formatIndicatorRate(indicT1, unit)}, ${formatIndicatorRate(indicT2, unit)}]`,
                      `]${formatIndicatorRate(indicT2, unit)}, ${indicMax}]`,
                  ]
                : null,
        indicQualif: [
            `${meta.indicator_label} parmi les plus faibles`,
            `${meta.indicator_label} intermédiaire`,
            `${meta.indicator_label} parmi les plus élevées`,
        ],
        // Les trois indicateurs sont des évolutions : accord au féminin
        adjectives: { faible: 'faible', moyen: 'moyenne', fort: 'forte' },
        childLandTypeLabel: getLandTypeLabel(scale, true).toLowerCase(),
    };
};

// Classe d'une valeur, avec la même règle que Highcharts : première classe dont les bornes encadrent la valeur
const classIndexOf = (value: number, classes: ValueClass[]): number | null => {
    const index = classes.findIndex((c) => (c.from === undefined || value >= c.from) && (c.to === undefined || value <= c.to));
    return index < 0 ? null : index;
};

// Un point Highcharts par territoire, avec ce dont les légendes et l'infobulle ont besoin
type MapPoint = {
    land_id: string;
    name: string;
    zone: string;
    value: number | null;
    color?: string;
    valueText: string;
    // Indice de classe (cartes simples) ou classe 0-8 (bivariées), null sans donnée
    legendKey: number | null;
};

interface NationalMapChartProps {
    baseMap?: NationalMapBaseMap;
    // Territoires de la zone affichée (déjà filtrés)
    features: NationalMapFeature[];
    zone: string;
    scale: string;
    indicator: Indicator;
    data?: NationalMapIndicators;
    loading: boolean;
    error: boolean;
    // Appelé avec la zone du territoire cliqué
    onZoneChange?: (zone: string) => void;
    // Contenu de la colonne de droite : au-dessus de la légende (chiffres clés) et en dessous (graphiques)
    keyFigures?: ReactNode;
    children?: ReactNode;
}

// Actions offertes au composant parent
export interface NationalMapChartHandle {
    // Télécharge la carte en PNG, avec son titre et sa légende
    exportPng: () => void;
}

const NationalMapChart = forwardRef<NationalMapChartHandle, NationalMapChartProps>(({
    baseMap,
    features,
    zone,
    scale,
    indicator,
    data,
    loading,
    error,
    onZoneChange,
    keyFigures,
    children,
}, ref) => {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({ exportPng: () => downloadChartPng(chartRef.current?.chart) }), []);
    // Territoire survolé sur la carte, et classe survolée dans la légende
    const [hoveredLand, setHoveredLand] = useState<HoveredLand | null>(null);
    const [hoveredLegendKey, setHoveredLegendKey] = useState<number | null>(null);

    // Le conteneur change de taille avec le panneau latéral et les onglets mobiles : on recale la carte
    useEffect(() => {
        if (!canvasRef.current || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(() => chartRef.current?.chart?.reflow());
        observer.observe(canvasRef.current);
        return () => observer.disconnect();
    }, []);

    const wholeFrance = zone === ZONE_FRANCE;
    // Un clic sur un territoire descend d'un niveau, sauf pour les communes
    const clickable = scale !== 'COMM';
    const bivariate = indicator.type === 'bivariate_map';
    const unavailable = Boolean(indicator.unavailable) || !data;
    const bivariateMeta = bivariate && data ? data.bivariate[indicator.id] : undefined;

    // Points de la carte et classes de couleurs
    const { points, classes } = useMemo(() => {
        const period = data ? periodLabel(data.start_year, data.end_year) : '';
        const raw = features.map((feature) => {
            const { land_id, name, has_conso } = feature.properties;
            const base = { land_id, name, zone: landToZone({ land_type: scale, land_id }) };
            const land = data?.lands[land_id];
            if (unavailable || !land) {
                return { ...base, value: null, color: has_conso && unavailable ? TERRITORY_COLOR : NO_DATA_COLOR, valueText: has_conso ? '' : 'Donnée non disponible' };
            }
            if (bivariate) {
                const v = land[indicator.id as 'bivariate_activite_emplois'] as NationalMapBivariateValue;
                if (!v || !bivariateMeta) return { ...base, value: null, color: NO_DATA_COLOR, valueText: 'Donnée non disponible' };
                return {
                    ...base,
                    value: v.class,
                    color: bivariateMeta.palette[v.class],
                    valueText: `${bivariateMeta.conso_label} : ${percent(v.conso_rate, 3)} par an<br/>${bivariateMeta.indicator_label} : ${percent(v.indic_rate)} par an`,
                };
            }
            const value = land[indicator.id as 'conso_ha'] as number | null;
            const text = formatValue(value, indicator);
            return { ...base, value, valueText: indicator.usesPeriod ? `${text} ${period}` : text };
        });
        const palette = indicator.palette === 'diverging' ? DIVERGING_PALETTE : SEQUENTIAL_PALETTE;
        const values = raw.map((p) => p.value).filter((v): v is number => v !== null);
        const cls: ValueClass[] = bivariate || unavailable ? [] : naturalBreaksClasses(values, palette, indicator);
        // Clé de légende : classe de valeur (cartes simples) ou classe 0-8 (bivariées)
        const legendKeyOf = (value: number | null): number | null => {
            if (value === null) return null;
            return bivariate ? value : classIndexOf(value, cls);
        };
        const pts: MapPoint[] = raw.map((p) => ({ ...p, legendKey: legendKeyOf(p.value) }));
        return { points: pts, classes: cls };
    }, [features, data, unavailable, bivariate, bivariateMeta, indicator, scale]);

    // Effectifs par classe, pour la légende des classes
    const counts = useMemo(() => {
        const perClass = classes.map(() => 0);
        let noData = 0;
        points.forEach((p) => {
            if (p.legendKey === null) noData += 1;
            else perClass[p.legendKey] += 1;
        });
        return { perClass, noData };
    }, [points, classes]);

    // Bornes des taux des territoires affichés, pour les intervalles de la légende bivariée
    const bivariateExtremes = useMemo(() => {
        if (!bivariate || !data) return { conso: extremes([]), indic: extremes([]) };
        const values = features.map((f) => data.lands[f.properties.land_id]?.[indicator.id as 'bivariate_activite_emplois'] as NationalMapBivariateValue);
        return { conso: extremes(values.map((v) => v?.conso_rate ?? null)), indic: extremes(values.map((v) => v?.indic_rate ?? null)) };
    }, [bivariate, data, features, indicator.id]);

    const showBivariateLegend = Boolean(bivariateMeta) && !unavailable;
    const showClassLegend = classes.length > 0;

    const options = useMemo<Highcharts.Options | null>(() => {
        if (!baseMap) return null;
        const insets = wholeFrance ? baseMap.insets : [];
        const separation = wholeFrance ? baseMap.separation : [];
        const exportSubtitle = [
            zoneLabel(zone, baseMap.parent),
            `par ${SCALE_LABELS[scale].toLowerCase()}`,
            data ? periodLabel(data.start_year, data.end_year) : '',
        ].filter(Boolean).join(' · ');

        return {
            chart: {
                map: { type: 'FeatureCollection', features } as unknown as Highcharts.GeoJSON,
                backgroundColor: 'transparent',
                animation: false,
                spacing: [16, 16, 16, 16],
                // Vue fixe : ni zoom ni déplacement, la carte reste ajustée à son conteneur
                panning: { enabled: false },
            },
            title: { text: undefined },
            credits: { enabled: false },
            // Pas de menu d'export sur la carte : le téléchargement est déclenché par le panneau (exportPng).
            // L'image exportée reçoit un titre, un sous-titre et la légende des classes dessinée par Highcharts.
            exporting: {
                enabled: false,
                fallbackToExportServer: false,
                filename: `carte-${zone.toLowerCase()}-${scale.toLowerCase()}-${indicator.id}`,
                sourceWidth: 1400,
                sourceHeight: 900,
                chartOptions: {
                    chart: { backgroundColor: '#ffffff', spacing: [24, 24, 24, 24] },
                    title: { text: indicator.label, align: 'left', style: { fontSize: '20px', fontWeight: '600' } },
                    subtitle: { text: exportSubtitle, align: 'left', style: { fontSize: '14px' } },
                    legend: {
                        enabled: classes.length > 0,
                        align: 'right',
                        verticalAlign: 'middle',
                        layout: 'vertical',
                        title: { text: indicator.unit ? UNIT_LABELS[indicator.unit] : undefined },
                        itemStyle: { fontSize: '13px', fontWeight: '400' },
                    },
                    credits: { enabled: true, text: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)' },
                },
            },
            accessibility: {
                description: wholeFrance
                    ? `Carte de la France entière par territoire, indicateur ${indicator.label}. Les régions d'outre-mer sont placées à gauche de l'Hexagone.`
                    : `Carte de la zone ${zoneLabel(zone, baseMap.parent)} par territoire, indicateur ${indicator.label}.`,
                point: { valueDescriptionFormat: '{point.name} : {point.valueText}' },
            },
            mapNavigation: { enabled: false },
            // Marges haute et gauche pour que les noms des îles, placées en haut à gauche, ne soient pas rognés
            mapView: { padding: [24, 4, 4, 44] },
            // Classes de couleurs des cartes simples ; les bivariées colorent chaque point directement
            colorAxis: classes.length > 0 ? { dataClasses: classes, dataClassColor: 'category' } : undefined,
            // La légende est dessinée en HTML à côté de la carte (voir Legend)
            legend: { enabled: false },
            tooltip: {
                headerFormat: '',
                pointFormat:
                    '<b>{point.name}</b><br/>{point.valueText}' +
                    (clickable ? '<br/><span style="font-size: 0.85em; opacity: 0.8">Cliquer pour afficher ce territoire</span>' : ''),
            },
            plotOptions: {
                series: { animation: false },
                map: {
                    point: {
                        events: {
                            // Un clic sur un territoire en fait la zone affichée
                            click: (event: Highcharts.PointClickEventObject) => {
                                const target = (event.point.options as { zone?: string }).zone;
                                if (clickable && target) onZoneChange?.(target);
                            },
                            // Le survol d'un territoire alimente la légende ; Highcharts passe le point en cible de l'événement
                            mouseOver: (event: Event) => {
                                const point = event.target as unknown as Highcharts.Point;
                                const { name, valueText, legendKey } = point.options as unknown as MapPoint;
                                const classIndex = legendKey ?? null;
                                setHoveredLand((current) =>
                                    current?.name === name && current.classIndex === classIndex
                                        ? current
                                        : { name, valueText: valueText.replace(/<br\/>/g, ', '), classIndex },
                                );
                            },
                            mouseOut: () => setHoveredLand(null),
                        },
                    },
                },
            },
            series: [
                {
                    type: 'map',
                    name: 'Territoires',
                    joinBy: 'land_id',
                    data: points,
                    nullColor: NO_DATA_COLOR,
                    borderColor: '#ffffff',
                    borderWidth: 0.6,
                    cursor: clickable ? 'pointer' : 'default',
                    // Au survol, la couleur de la donnée reste visible : seul le contour s'épaissit
                    states: {
                        hover: { brightness: 0, borderColor: '#1a1a1a', borderWidth: 1.5 },
                        inactive: { opacity: 1 },
                    },
                },
                {
                    // Ligne séparant les territoires d'outre-mer déplacés du reste de la carte
                    type: 'mapline',
                    name: "Séparation des territoires d'outre-mer",
                    data: [{ geometry: { type: 'LineString', coordinates: separation } }],
                    // Un point sans valeur est tracé avec nullColor : il faut la définir aussi
                    color: SEPARATION_COLOR,
                    nullColor: SEPARATION_COLOR,
                    lineWidth: 1,
                    enableMouseTracking: false,
                    states: { inactive: { opacity: 1 } },
                    showInLegend: false,
                },
                {
                    // Nom de chaque territoire d'outre-mer déplacé, juste au-dessus de lui
                    type: 'mappoint',
                    name: "Noms des territoires d'outre-mer",
                    data: insets.map((inset) => ({
                        name: inset.name,
                        geometry: {
                            type: 'Point',
                            coordinates: [(inset.bbox[0] + inset.bbox[2]) / 2, inset.bbox[3]],
                        },
                    })),
                    marker: { enabled: false },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        verticalAlign: 'bottom',
                        y: -2,
                        style: { color: TERRITORY_COLOR, fontWeight: '600', fontSize: '0.8rem', textOutline: 'none' },
                    },
                    enableMouseTracking: false,
                    showInLegend: false,
                },
            ] as Highcharts.SeriesOptionsType[],
        };
    }, [baseMap, features, wholeFrance, clickable, zone, scale, indicator, data, points, classes, onZoneChange]);

    // Survol d'une classe dans la légende : les territoires des autres classes s'estompent
    useEffect(() => {
        const series = chartRef.current?.chart?.series?.[0];
        if (!series) return;
        series.points.forEach((point) => {
            const key = (point.options as unknown as MapPoint).legendKey;
            const dimmed = hoveredLegendKey !== null && key !== hoveredLegendKey;
            point.graphic?.attr({ 'fill-opacity': dimmed ? DIMMED_OPACITY : 1 });
        });
    }, [hoveredLegendKey, options]);

    // Mémorisé : HighchartsReact recrée le graphique (mode immutable) dès que ces props changent d'identité
    const containerProps = useMemo(
        () => ({ className: 'national-map-canvas', style: { opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' } }),
        [loading],
    );

    const missing = useMemo(
        () => features.filter((f) => !f.properties.has_conso).map((f) => f.properties.name).sort((a, b) => a.localeCompare(b, 'fr')),
        [features],
    );
    const footnote = baseMap ? missingDataSentence(missing, wholeFrance) : null;
    const hoveredCell = hoveredLand?.classIndex !== null && hoveredLand?.classIndex !== undefined
        ? { row: Math.floor(hoveredLand.classIndex / 3), col: hoveredLand.classIndex % 3 }
        : null;

    return (
        <Row>
            <MapCard>
                <Canvas ref={canvasRef}>
                    {indicator.unavailable && <Banner role="status">{indicator.unavailable}</Banner>}
                    {error && <Message>Le fond de carte n'a pas pu être chargé.</Message>}
                    {!error && !options && <Message>Chargement de la carte…</Message>}
                    {options && (
                        <HighchartsReact
                            ref={chartRef}
                            highcharts={Highcharts}
                            constructorType="mapChart"
                            options={options}
                            // Le fond et les classes changent avec la zone et l'indicateur : on recrée le graphique
                            immutable
                            containerProps={containerProps}
                        />
                    )}
                </Canvas>
                {footnote && <Footnote>{footnote}</Footnote>}
            </MapCard>
            <Aside aria-label="Chiffres clés, légende et graphiques">
                {keyFigures}
                {showClassLegend && (
                    <Legend aria-label="Légende de la carte">
                        <ClassLegend
                            indicatorLabel={indicator.label}
                            classes={classes}
                            counts={counts.perClass}
                            noDataCount={counts.noData}
                            landTypeLabel={getLandTypeLabel(scale, true)}
                            hoveredLand={hoveredLand}
                            onClassHover={setHoveredLegendKey}
                        />
                    </Legend>
                )}
                {showBivariateLegend && bivariateMeta && (
                    <Legend aria-label="Légende de la carte">
                        <BivariateLegend
                            {...bivariateLegendProps(bivariateMeta, scale, bivariateExtremes.conso, bivariateExtremes.indic)}
                            highlightedCell={hoveredCell}
                            onCellHover={(cell) => setHoveredLegendKey(cell ? cell.row * 3 + cell.col : null)}
                            compact
                        />
                    </Legend>
                )}
                {children}
            </Aside>
        </Row>
    );
});

NationalMapChart.displayName = 'NationalMapChart';

export default NationalMapChart;

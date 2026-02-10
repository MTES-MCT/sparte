import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import ChartDataTable from "@components/charts/ChartDataTable";
import { formatNumber } from "@utils/formatUtils";
import type { ExpressionSpecification } from "maplibre-gl";

type DestinationType = "total" | "habitat" | "activite" | "mixte" | "route" | "ferroviaire" | "inconnu";

// Couleurs du projet (voir highcharts/charts.py) dans l'ordre du pie chart "Consommation par destination"
const DESTINATION_CONFIG: Record<DestinationType, { label: string; suffix: string; color: string; lightText?: boolean }> = {
    total: { label: "Total", suffix: "", color: "#6A6AF4", lightText: true },
    habitat: { label: "Habitat", suffix: "_habitat", color: "#6a6af4", lightText: true },      // 1ère couleur - violet
    activite: { label: "Activité", suffix: "_activite", color: "#8ecac7" },   // 2ème couleur - vert turquoise
    mixte: { label: "Mixte", suffix: "_mixte", color: "#eeb088" },            // 3ème couleur - orange clair
    route: { label: "Route", suffix: "_route", color: "#cab8ee" },            // 4ème couleur - violet clair
    ferroviaire: { label: "Ferroviaire", suffix: "_ferroviaire", color: "#6b8abc", lightText: true }, // 5ème couleur - bleu
    inconnu: { label: "Inconnu", suffix: "_inconnu", color: "#86cdf2" },      // 6ème couleur - bleu clair
};

const LegendContainer = styled.div`
    position: absolute;
    top: 10px;
    left: 10px;
    background: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11px;
    z-index: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const LegendTitle = styled.div`
    font-weight: bold;
    margin-bottom: 6px;
`;

const LegendGradient = styled.div<{ $colors: string[] }>`
    height: 12px;
    width: 150px;
    border-radius: 2px;
    background: linear-gradient(to right, ${({ $colors }) => $colors.join(", ")});
`;

const LegendLabels = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 10px;
    color: #666;
`;

const LegendIndicator = styled.div<{ $position: number }>`
    position: absolute;
    left: ${({ $position }) => $position}%;
    top: -2px;
    width: 2px;
    height: 16px;
    background-color: #000;
    transform: translateX(-50%);
    pointer-events: none;
    transition: left 0.15s ease-out;
`;

const LegendGradientContainer = styled.div`
    position: relative;
`;

const MapOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.6);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
`;

const OverlayLoader = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #e0e0e0;
    border-top-color: #6A6AF4;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const SidePanel = styled.div`
    background: #f6f6f6;
    border-radius: 4px;
    padding: 1rem;
    height: 100%;
    font-size: 0.85rem;
    overflow-y: auto;
`;

const SidePanelPlaceholder = styled.div`
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 2rem 1rem;
`;

function buildCumulativeColorExpression(
    startYear: number,
    endYear: number,
    destination: DestinationType
): ExpressionSpecification {
    const minYear = Math.max(startYear, 2011);
    const maxYear = Math.min(endYear, 2023);
    const suffix = DESTINATION_CONFIG[destination].suffix;
    const baseColor = DESTINATION_CONFIG[destination].color;

    const yearFields: ExpressionSpecification[] = [];
    for (let year = minYear; year <= maxYear; year++) {
        yearFields.push(["coalesce", ["get", `conso_${year}${suffix}`], 0] as ExpressionSpecification);
    }

    let cumulativeExpression: ExpressionSpecification;
    if (yearFields.length === 0) {
        cumulativeExpression = ["literal", 0] as ExpressionSpecification;
    } else if (yearFields.length === 1) {
        cumulativeExpression = yearFields[0];
    } else {
        cumulativeExpression = ["+", ...yearFields] as ExpressionSpecification;
    }

    return [
        "interpolate",
        ["linear"],
        cumulativeExpression,
        0, "#ffffff",
        100, adjustColorOpacity(baseColor, 0.3),
        500, adjustColorOpacity(baseColor, 0.5),
        1000, adjustColorOpacity(baseColor, 0.7),
        2500, baseColor,
        5000, darkenColor(baseColor, 0.3)
    ] as ExpressionSpecification;
}

function adjustColorOpacity(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.round(r + (255 - r) * (1 - opacity));
    const newG = Math.round(g + (255 - g) * (1 - opacity));
    const newB = Math.round(b + (255 - b) * (1 - opacity));
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

function darkenColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

interface CarroyageLeaMapProps {
    landData: LandDetailResultType;
    startYear: number;
    endYear: number;
    center?: [number, number] | null;
    onMapLoad?: (map: maplibregl.Map) => void;
}

export const CarroyageLeaMap: React.FC<CarroyageLeaMapProps> = ({
    landData,
    startYear,
    endYear,
    center,
    onMapLoad
}) => {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<DestinationType>("total");
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [hoveredValue, setHoveredValue] = useState<number | null>(null);
    const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);

    const extendedLandData = useMemo(() => ({
        ...landData,
        startYear,
        endYear
    }), [landData, startYear, endYear]) as LandDetailResultType & { startYear: number; endYear: number };

    // Mettre à jour le style quand les années ou la destination changent
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;
        if (!map.getLayer("carroyage-lea-layer")) return;

        setIsUpdating(true);

        requestAnimationFrame(() => {
            const colorExpression = buildCumulativeColorExpression(startYear, endYear, selectedDestination);
            map.setPaintProperty("carroyage-lea-layer", "fill-color", colorExpression);

            map.once("idle", () => {
                setIsUpdating(false);
            });
        });
    }, [startYear, endYear, selectedDestination]);

    // Calculer la position de l'indicateur sur la légende (0-100%)
    // Seuils fixes: 0, 100, 500, 1000, 5000 (en m²)
    const getIndicatorPosition = useCallback((value: number): number => {
        const thresholds = [0, 100, 500, 1000, 5000];
        const positions = [0, 25, 50, 75, 100];

        if (value <= 0) return 0;
        if (value >= 5000) return 100;

        for (let i = 0; i < thresholds.length - 1; i++) {
            if (value >= thresholds[i] && value < thresholds[i + 1]) {
                const ratio = (value - thresholds[i]) / (thresholds[i + 1] - thresholds[i]);
                return positions[i] + ratio * (positions[i + 1] - positions[i]);
            }
        }
        return 100;
    }, []);

    // Calculer la valeur cumulée pour une feature
    const calculateCumulativeValue = useCallback((properties: Record<string, unknown>) => {
        const suffix = DESTINATION_CONFIG[selectedDestination].suffix;
        const minYear = Math.max(startYear, 2011);
        const maxYear = Math.min(endYear, 2023);
        let total = 0;
        for (let year = minYear; year <= maxYear; year++) {
            const key = `conso_${year}${suffix}`;
            const value = properties[key];
            if (typeof value === "number") {
                total += value;
            }
        }
        return total;
    }, [selectedDestination, startYear, endYear]);

    // Écouter les événements de survol et de clic sur la carte
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;

        const map = mapRef.current;

        const handleMouseMove = (e: maplibregl.MapLayerMouseEvent) => {
            if (selectedFeature) return;
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                const properties = feature.properties || {};
                const value = calculateCumulativeValue(properties);
                setHoveredValue(value);
                setHoveredFeature(feature);
                map.getCanvas().style.cursor = 'pointer';
            }
        };

        const handleMouseLeave = () => {
            if (selectedFeature) return;
            setHoveredValue(null);
            setHoveredFeature(null);
            map.getCanvas().style.cursor = '';
        };

        let clickedOnCell = false;

        const handleCellClick = (e: maplibregl.MapLayerMouseEvent) => {
            clickedOnCell = true;
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                const properties = feature.properties || {};
                const value = calculateCumulativeValue(properties);
                setHoveredValue(value);
                setHoveredFeature(feature);
                setSelectedFeature(feature);
            }
        };

        const handleMapClick = () => {
            if (clickedOnCell) {
                clickedOnCell = false;
                return;
            }
            setSelectedFeature(null);
        };

        map.on("mousemove", "carroyage-lea-layer", handleMouseMove);
        map.on("mouseleave", "carroyage-lea-layer", handleMouseLeave);
        map.on("click", "carroyage-lea-layer", handleCellClick);
        map.on("click", handleMapClick);

        return () => {
            map.off("mousemove", "carroyage-lea-layer", handleMouseMove);
            map.off("mouseleave", "carroyage-lea-layer", handleMouseLeave);
            map.off("click", "carroyage-lea-layer", handleCellClick);
            map.off("click", handleMapClick);
            map.getCanvas().style.cursor = '';
        };
    }, [isMapLoaded, calculateCumulativeValue, selectedFeature]);

    // Ajuster l'opacité et afficher la cellule sélectionnée en surbrillance
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;
        const map = mapRef.current;
        if (!map.getLayer("carroyage-lea-layer")) return;

        const highlightSourceId = "carroyage-highlight-source";
        const highlightLayerId = "carroyage-highlight-layer";
        const highlightOutlineId = "carroyage-highlight-outline";

        if (selectedFeature) {
            map.setPaintProperty("carroyage-lea-layer", "fill-opacity", 0.15);

            const geojson: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: [{
                    type: "Feature",
                    geometry: selectedFeature.geometry,
                    properties: selectedFeature.properties || {},
                }],
            };

            if (map.getSource(highlightSourceId)) {
                (map.getSource(highlightSourceId) as maplibregl.GeoJSONSource).setData(geojson);
            } else {
                map.addSource(highlightSourceId, { type: "geojson", data: geojson });
                const colorExpression = buildCumulativeColorExpression(startYear, endYear, selectedDestination);
                map.addLayer({
                    id: highlightLayerId,
                    type: "fill",
                    source: highlightSourceId,
                    paint: {
                        "fill-color": colorExpression,
                        "fill-opacity": 0.7,
                    },
                });
                map.addLayer({
                    id: highlightOutlineId,
                    type: "line",
                    source: highlightSourceId,
                    paint: {
                        "line-color": "#333",
                        "line-width": 2,
                    },
                });
            }
        } else {
            map.setPaintProperty("carroyage-lea-layer", "fill-opacity", 0.7);

            if (map.getLayer(highlightOutlineId)) map.removeLayer(highlightOutlineId);
            if (map.getLayer(highlightLayerId)) map.removeLayer(highlightLayerId);
            if (map.getSource(highlightSourceId)) map.removeSource(highlightSourceId);
        }
    }, [selectedFeature, isMapLoaded, startYear, endYear, selectedDestination]);

    const handleMapLoad = useCallback((map: maplibregl.Map) => {
        mapRef.current = map;

        // Appliquer immédiatement le style avec la destination par défaut
        const colorExpression = buildCumulativeColorExpression(startYear, endYear, "total");
        map.setPaintProperty("carroyage-lea-layer", "fill-color", colorExpression);

        setIsMapLoaded(true);
        onMapLoad?.(map);
    }, [onMapLoad, startYear, endYear]);

    const config = useMemo(() => defineMapConfig({
        sources: [
            { type: "osm" },
            { type: "emprise" },
            { type: "carroyage-lea" }
        ],
        layers: [
            { type: "osm" },
            { type: "carroyage-lea" },
            { type: "carroyage-lea-outline" },
            { type: "emprise" }
        ],
        controlGroups: [
            {
                id: "osm-group",
                label: "Fond de carte",
                description: "OpenStreetMap",
                controls: [
                    {
                        id: "osm-visibility",
                        type: "visibility",
                        targetLayers: ["osm-layer"],
                        defaultValue: true
                    },
                    {
                        id: "osm-opacity",
                        type: "opacity",
                        targetLayers: ["osm-layer"],
                        defaultValue: 1
                    }
                ]
            },
            {
                id: "emprise-group",
                label: "Emprise du territoire",
                description: "Contour géographique du territoire",
                controls: [
                    {
                        id: "emprise-visibility",
                        type: "visibility",
                        targetLayers: ["emprise-layer"],
                        defaultValue: true
                    },
                    {
                        id: "emprise-opacity",
                        type: "opacity",
                        targetLayers: ["emprise-layer"],
                        defaultValue: 1
                    }
                ]
            },
            {
                id: "carroyage-lea-group",
                label: "Consommation d'espaces (carroyage)",
                description: "Carroyage de la consommation d'espaces NAF issue des fichiers fonciers (Cerema)",
                controls: [
                    {
                        id: "carroyage-lea-visibility",
                        type: "visibility",
                        targetLayers: ["carroyage-lea-layer", "carroyage-lea-layer-outline"],
                        defaultValue: true
                    },
                    {
                        id: "carroyage-lea-opacity",
                        type: "opacity",
                        targetLayers: ["carroyage-lea-layer"],
                        defaultValue: 0.7
                    }
                ]
            }
        ],
    }), [startYear, endYear, selectedDestination]);

    return (
        <>
        <div className="fr-mb-2w">
            {(Object.keys(DESTINATION_CONFIG) as DestinationType[]).map((dest) => (
                <React.Fragment key={dest}>
                {dest === 'habitat' && (
                    <span style={{ display: 'inline-block', width: 1, height: 24, backgroundColor: '#ccc', marginRight: 8, verticalAlign: 'middle' }} />
                )}
                <button
                    className={`fr-btn ${
                        selectedDestination === dest ? 'fr-btn--primary' : 'fr-btn--tertiary'
                    } fr-btn--sm fr-mr-1w fr-mb-1w`}
                    onClick={() => setSelectedDestination(dest)}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: DESTINATION_CONFIG[dest].color,
                            marginRight: 6,
                            verticalAlign: 'middle',
                            border: selectedDestination === dest ? '1px solid white' : '1px solid #ccc',
                        }}
                    />
                    {DESTINATION_CONFIG[dest].label}
                </button>
                </React.Fragment>
            ))}
            {selectedFeature && (
                <>
                <span style={{ display: 'inline-block', width: 1, height: 24, backgroundColor: '#ccc', marginRight: 8, marginLeft: 4, verticalAlign: 'middle' }} />
                <button
                    className="fr-btn fr-btn--tertiary fr-btn--sm"
                    onClick={() => setSelectedFeature(null)}
                >
                    Cellule sélectionnée ✕
                </button>
                </>
            )}
        </div>
        <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-lg-8">
                <BaseMap
                    id="carroyage-lea-map"
                    config={config}
                    landData={extendedLandData}
                    center={center}
                    onMapLoad={handleMapLoad}
                >
                    {(!isMapLoaded || isUpdating) && (
                        <MapOverlay>
                            <OverlayLoader />
                        </MapOverlay>
                    )}
                    <LegendContainer>
                        <LegendTitle>Consommation (ha)</LegendTitle>
                        <LegendGradientContainer>
                            <LegendGradient
                                $colors={[
                                    "#ffffff",
                                    adjustColorOpacity(DESTINATION_CONFIG[selectedDestination].color, 0.3),
                                    adjustColorOpacity(DESTINATION_CONFIG[selectedDestination].color, 0.5),
                                    adjustColorOpacity(DESTINATION_CONFIG[selectedDestination].color, 0.7),
                                    DESTINATION_CONFIG[selectedDestination].color,
                                    darkenColor(DESTINATION_CONFIG[selectedDestination].color, 0.3),
                                ]}
                            />
                            {hoveredValue !== null && (
                                <LegendIndicator $position={getIndicatorPosition(hoveredValue)} />
                            )}
                        </LegendGradientContainer>
                        <LegendLabels>
                            <span>0</span>
                            <span>0,1</span>
                            <span>0,5+</span>
                        </LegendLabels>
                    </LegendContainer>
                </BaseMap>
            </div>
            <div className="fr-col-12 fr-col-lg-4">
                <SidePanel>
                    {(selectedFeature || hoveredFeature) ? (
                        <>
                        <ChartDataTable
                            title={`Consommation - ${DESTINATION_CONFIG[selectedDestination].label}`}
                            compact
                            data={(() => {
                                const activeFeature = selectedFeature || hoveredFeature;
                                const props = activeFeature!.properties || {};
                                const suffix = DESTINATION_CONFIG[selectedDestination].suffix;
                                const minYear = Math.max(startYear, 2011);
                                const maxYear = Math.min(endYear, 2023);
                                const yearlyData: { year: number; valueHa: number; raw: number }[] = [];
                                let total = 0;
                                for (let year = minYear; year <= maxYear; year++) {
                                    const key = `conso_${year}${suffix}`;
                                    const value = typeof props[key] === 'number' ? props[key] : 0;
                                    const valueHa = Math.round((value / 10000) * 100) / 100;
                                    total += value;
                                    yearlyData.push({ year, valueHa, raw: value });
                                }
                                const totalHa = Math.round((total / 10000) * 100) / 100;
                                const fmt = (v: number) => formatNumber({ number: v, decimals: 2, addSymbol: true });
                                const rows: Array<{ name: string; data: any[] }> = yearlyData.map(({ year, valueHa, raw }) => {
                                    const isSignificant = total > 0 && (raw / total) * 100 > 10;
                                    if (isSignificant) {
                                        return { name: '', data: [
                                            <strong key={`y-${year}`}>{year}</strong>,
                                            <strong key={`v-${year}`}>{fmt(valueHa)}</strong>,
                                        ] };
                                    }
                                    return { name: '', data: [String(year), fmt(valueHa)] };
                                });
                                rows.push({ name: '', data: ['Total', fmt(totalHa)] });
                                return {
                                    headers: ['Année', 'Consommation (ha)'],
                                    rows,
                                    boldLastRow: true,
                                };
                            })()}
                        />
                        </>
                    ) : (
                        <SidePanelPlaceholder>
                            Survolez ou cliquez sur une cellule sur la carte pour afficher le détail de la consommation
                        </SidePanelPlaceholder>
                    )}
                </SidePanel>
            </div>
        </div>
        </>
    );
};

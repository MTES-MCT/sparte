import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { useGetCarroyageBoundsQuery, useGetCarroyageDestinationConfigQuery, useGetLandChildrenGeomQuery } from "@services/api";
import Loader from "@components/ui/Loader";
import type { ExpressionSpecification } from "maplibre-gl";
import { CarroyageLeaSidePanel } from "./sidePanel";

type DestinationType = string;
type DestinationConfig = Record<string, { label: string; suffix: string; color: string; light_text: boolean }>;

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

const ButtonSeparator = styled.span`
    display: inline-block;
    width: 1px;
    height: 24px;
    background-color: #ccc;
    margin-right: 8px;
    vertical-align: middle;
`;

const ColorDot = styled.span<{ $color: string; $active: boolean }>`
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ $color }) => $color};
    margin-right: 6px;
    vertical-align: middle;
    border: 1px solid ${({ $active }) => ($active ? 'white' : '#ccc')};
`;

function buildCumulativeExpression(
    startYear: number,
    endYear: number,
    suffix: string
): ExpressionSpecification {
    const minYear = Math.max(startYear, 2011);
    const maxYear = Math.min(endYear, 2023);

    const yearFields: ExpressionSpecification[] = [];
    for (let year = minYear; year <= maxYear; year++) {
        yearFields.push(["coalesce", ["get", `conso_${year}${suffix}`], 0] as ExpressionSpecification);
    }

    if (yearFields.length === 0) return ["literal", 0] as ExpressionSpecification;
    if (yearFields.length === 1) return yearFields[0];
    return ["+", ...yearFields] as ExpressionSpecification;
}

function buildCumulativeFilter(
    startYear: number,
    endYear: number,
    suffix: string
): ExpressionSpecification {
    return [">", buildCumulativeExpression(startYear, endYear, suffix), 0] as ExpressionSpecification;
}

function buildCumulativeColorExpression(
    startYear: number,
    endYear: number,
    destination: DestinationType,
    config: DestinationConfig,
    bounds: { min_value: number; max_value: number } | null
): ExpressionSpecification {
    const suffix = config[destination].suffix;
    const baseColor = config[destination].color;
    const stops = buildColorStops(baseColor, bounds);
    if (!stops) return null;
    const cumulativeExpression = buildCumulativeExpression(startYear, endYear, suffix);
    const colorStops = stops.flatMap(([threshold, color]) => [threshold, color]);

    return [
        "interpolate",
        ["linear"],
        cumulativeExpression,
        ...colorStops,
    ] as ExpressionSpecification;
}

function parseHex(hex: string): [number, number, number] {
    return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}

function toHex(r: number, g: number, b: number): string {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function adjustColorOpacity(hex: string, opacity: number): string {
    const [r, g, b] = parseHex(hex);
    return toHex(
        Math.round(r + (255 - r) * (1 - opacity)),
        Math.round(g + (255 - g) * (1 - opacity)),
        Math.round(b + (255 - b) * (1 - opacity)),
    );
}

function darkenColor(hex: string, factor: number): string {
    const [r, g, b] = parseHex(hex);
    return toHex(
        Math.round(r * (1 - factor)),
        Math.round(g * (1 - factor)),
        Math.round(b * (1 - factor)),
    );
}

// Opacities for the 6 color stops (from white to darkened)
const OPACITY_STOPS: number[] = [0, 0.3, 0.5, 0.7, 1, -0.3];
// Relative positions of stops (non-linear)
const STOP_RATIOS: number[] = [0, 0.02, 0.1, 0.2, 0.5, 1];

function buildDynamicColorStops(bounds: { min_value: number; max_value: number } | null): number[] | null {
    if (!bounds || bounds.max_value <= 0) return null;
    // Convert max from ha to m² for the map expression (tile data is in m²)
    const maxM2 = bounds.max_value * 10000;
    return STOP_RATIOS.map((ratio) => Math.round(ratio * maxM2));
}

function buildColorStops(baseColor: string, bounds: { min_value: number; max_value: number } | null): [number, string][] | null {
    const thresholds = buildDynamicColorStops(bounds);
    if (!thresholds) return null;
    return thresholds.map((threshold, i) => {
        const opacity = OPACITY_STOPS[i];
        if (opacity === 0) return [threshold, "#ffffff"] as [number, string];
        if (opacity < 0) return [threshold, darkenColor(baseColor, -opacity)] as [number, string];
        if (opacity === 1) return [threshold, baseColor] as [number, string];
        return [threshold, adjustColorOpacity(baseColor, opacity)] as [number, string];
    });
}

interface CarroyageLeaMapProps {
    landData: LandDetailResultType;
    startYear: number;
    endYear: number;
    childLandType?: string;
    center?: [number, number] | null;
    onMapLoad?: (map: maplibregl.Map) => void;
}

export const CarroyageLeaMap: React.FC<CarroyageLeaMapProps> = ({
    landData,
    startYear,
    endYear,
    childLandType,
    center,
    onMapLoad
}) => {
    const { data: destinationConfig } = useGetCarroyageDestinationConfigQuery(undefined);
    const { land_type, land_id } = landData || {};
    const { data: boundsData } = useGetCarroyageBoundsQuery(
        { land_type, land_id, start_year: startYear, end_year: endYear },
        { skip: !land_type || !land_id || startYear >= endYear }
    );
    const geomChildType = (childLandType === "EPCI" || childLandType === "SCOT") ? "COMM" : childLandType;
    const { data: childrenGeom } = useGetLandChildrenGeomQuery(
        geomChildType ? { land_type, land_id, child_land_type: geomChildType } : undefined,
        { skip: !geomChildType }
    );
    const getBoundsForDestination = useCallback((dest: string): { min_value: number; max_value: number } | null => {
        if (!boundsData || !Array.isArray(boundsData)) return null;
        const entry = boundsData.find((b: { destination: string }) => b.destination === dest);
        return entry ? { min_value: entry.min_value, max_value: entry.max_value } : null;
    }, [boundsData]);

    const mapRef = useRef<maplibregl.Map | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<DestinationType>("total");
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [hoveredValue, setHoveredValue] = useState<number | null>(null);
    const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
    const [hoveredChildName, setHoveredChildName] = useState<string | null>(null);
    const [hoveredCoords, setHoveredCoords] = useState<{ lng: number; lat: number } | null>(null);

    const extendedLandData = useMemo(() => ({
        ...landData,
        startYear,
        endYear
    }), [landData, startYear, endYear]) as LandDetailResultType & { startYear: number; endYear: number };

    // Mettre à jour le style quand les années ou la destination changent
    useEffect(() => {
        if (!mapRef.current || !destinationConfig) return;

        const map = mapRef.current;
        if (!map.getLayer("carroyage-lea-layer")) return;

        setIsUpdating(true);

        requestAnimationFrame(() => {
            const bounds = getBoundsForDestination(selectedDestination);
            const suffix = destinationConfig[selectedDestination].suffix;
            const colorExpression = buildCumulativeColorExpression(startYear, endYear, selectedDestination, destinationConfig, bounds);
            const nonZeroFilter = buildCumulativeFilter(startYear, endYear, suffix);
            const territoryFilter = ["in", land_id, ["get", land_type]] as ExpressionSpecification;
            const combinedFilter = ["all", territoryFilter, nonZeroFilter] as ExpressionSpecification;
            if (colorExpression) {
                map.setPaintProperty("carroyage-lea-layer", "fill-color", colorExpression);
            }
            map.setFilter("carroyage-lea-layer", combinedFilter);
            if (map.getLayer("carroyage-lea-layer-outline")) {
                map.setFilter("carroyage-lea-layer-outline", combinedFilter);
            }

            map.once("idle", () => {
                setIsUpdating(false);
            });
        });
    }, [startYear, endYear, selectedDestination, destinationConfig, boundsData, getBoundsForDestination, land_type, land_id]);

    const getIndicatorPosition = useCallback((value: number): number => {
        const bounds = getBoundsForDestination(selectedDestination);
        const thresholds = buildDynamicColorStops(bounds);
        if (!thresholds) return 0;
        const step = 100 / (thresholds.length - 1);
        const positions = thresholds.map((_, i) => i * step);

        if (value <= thresholds[0]) return 0;
        if (value >= thresholds.at(-1)!) return 100;

        for (let i = 0; i < thresholds.length - 1; i++) {
            if (value >= thresholds[i] && value < thresholds[i + 1]) {
                const ratio = (value - thresholds[i]) / (thresholds[i + 1] - thresholds[i]);
                return positions[i] + ratio * (positions[i + 1] - positions[i]);
            }
        }
        return 100;
    }, [getBoundsForDestination, selectedDestination]);

    // Calculer la valeur cumulée pour une feature
    const calculateCumulativeValue = useCallback((properties: Record<string, unknown>) => {
        if (!destinationConfig) return 0;
        const suffix = destinationConfig[selectedDestination].suffix;
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
    }, [selectedDestination, startYear, endYear, destinationConfig]);

    // Ajouter/mettre à jour les contours des mailles d'analyse
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;

        const map = mapRef.current;
        const sourceId = "children-geom-source";
        const layerId = "children-geom-layer";

        const fillLayerId = "children-geom-fill-layer";
        if (!childrenGeom) {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
            return;
        }

        const source = map.getSource(sourceId);
        if (source) {
            (source as maplibregl.GeoJSONSource).setData(childrenGeom);
        } else {
            map.addSource(sourceId, {
                type: "geojson",
                data: childrenGeom,
            });
            map.addLayer({
                id: fillLayerId,
                type: "fill",
                source: sourceId,
                paint: {
                    "fill-color": "transparent",
                    "fill-opacity": 0,
                },
            });
            map.addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                paint: {
                    "line-color": "#f0c808",
                    "line-width": 2,
                    "line-opacity": 0.7,
                },
            });
        }
    }, [isMapLoaded, childrenGeom]);

    // Survol des contours enfants
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;

        const map = mapRef.current;
        const layerId = "children-geom-fill-layer";

        const onMove = (e: maplibregl.MapLayerMouseEvent) => {
            if (e.features && e.features.length > 0) {
                const name = e.features[0].properties?.name;
                setHoveredChildName(name || null);
            }
            setHoveredCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        };

        const onLeave = () => {
            setHoveredChildName(null);
            setHoveredCoords(null);
        };

        map.on("mousemove", layerId, onMove);
        map.on("mouseleave", layerId, onLeave);

        return () => {
            map.off("mousemove", layerId, onMove);
            map.off("mouseleave", layerId, onLeave);
        };
    }, [isMapLoaded, childrenGeom]);

    // Écouter les événements de survol sur la carte
    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;

        const map = mapRef.current;

        const handleMouseMove = (e: maplibregl.MapLayerMouseEvent) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                const properties = feature.properties || {};
                const value = calculateCumulativeValue(properties);
                setHoveredValue(value);
                setHoveredFeature(feature);
                setHoveredCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
            }
        };

        const handleMouseLeave = () => {
            setHoveredValue(null);
            setHoveredFeature(null);
            setHoveredCoords(null);
        };

        map.on("mousemove", "carroyage-lea-layer", handleMouseMove);
        map.on("mouseleave", "carroyage-lea-layer", handleMouseLeave);

        return () => {
            map.off("mousemove", "carroyage-lea-layer", handleMouseMove);
            map.off("mouseleave", "carroyage-lea-layer", handleMouseLeave);
        };
    }, [isMapLoaded, calculateCumulativeValue]);

    const handleMapLoad = useCallback((map: maplibregl.Map) => {
        mapRef.current = map;

        // Offset the map center to account for the side panel
        requestAnimationFrame(() => {
            const containerWidth = map.getContainer().clientWidth;
            const remInPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
            const sidePanelWidth = Math.round(containerWidth * 0.33 + 1.5 * remInPx);
            map.setPadding({ top: 0, bottom: 0, left: 0, right: sidePanelWidth });
            if (landData.bounds) {
                map.fitBounds(landData.bounds, {
                    padding: { top: 120, bottom: 120, left: 60, right: 60 }, animate: false,
                });
            }
        });

        // Appliquer immédiatement le style avec la destination par défaut
        if (destinationConfig) {
            const bounds = getBoundsForDestination("total");
            const suffix = destinationConfig["total"].suffix;
            const colorExpression = buildCumulativeColorExpression(startYear, endYear, "total", destinationConfig, bounds);
            const nonZeroFilter = buildCumulativeFilter(startYear, endYear, suffix);
            const territoryFilter = ["in", land_id, ["get", land_type]] as ExpressionSpecification;
            const combinedFilter = ["all", territoryFilter, nonZeroFilter] as ExpressionSpecification;
            if (colorExpression) {
                map.setPaintProperty("carroyage-lea-layer", "fill-color", colorExpression);
            }
            map.setFilter("carroyage-lea-layer", combinedFilter);
            if (map.getLayer("carroyage-lea-layer-outline")) {
                map.setFilter("carroyage-lea-layer-outline", combinedFilter);
            }
        }

        setIsMapLoaded(true);
        onMapLoad?.(map);
    }, [onMapLoad, startYear, endYear, destinationConfig, getBoundsForDestination, landData.bounds, land_id, land_type]);

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
    }), []);

    if (!destinationConfig) {
        return <Loader size={32} />;
    }

    const currentBounds = getBoundsForDestination(selectedDestination);
    const maxHa = currentBounds?.max_value ?? 0.5;
    const midHa = maxHa / 2;
    const formatLegend = (v: number) => v >= 1 ? Math.round(v).toString() : v.toFixed(2).replace('.', ',');

    return (
        <>
        <div className="fr-mb-2w">
            {Object.keys(destinationConfig).map((dest, index) => (
                <React.Fragment key={dest}>
                {index === 1 && <ButtonSeparator />}
                <button
                    className={`fr-btn ${
                        selectedDestination === dest ? 'fr-btn--primary' : 'fr-btn--tertiary'
                    } fr-btn--sm fr-mr-1w fr-mb-1w`}
                    onClick={() => setSelectedDestination(dest)}
                >
                    <ColorDot $color={destinationConfig[dest].color} $active={selectedDestination === dest} />
                    {destinationConfig[dest].label}
                </button>
                </React.Fragment>
            ))}
        </div>
        <BaseMap
            id="carroyage-lea-map"
            config={config}
            landData={extendedLandData}
            center={center}
            onMapLoad={handleMapLoad}
            sidePanel={
                <CarroyageLeaSidePanel
                    feature={hoveredFeature}
                    hoveredChildName={hoveredChildName}
                    hoveredCoords={hoveredCoords}
                    hoveredValue={hoveredValue}
                    destinationConfig={destinationConfig}
                    selectedDestination={selectedDestination}
                    startYear={startYear}
                    endYear={endYear}
                />
            }
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
                            adjustColorOpacity(destinationConfig[selectedDestination].color, 0.3),
                            adjustColorOpacity(destinationConfig[selectedDestination].color, 0.5),
                            adjustColorOpacity(destinationConfig[selectedDestination].color, 0.7),
                            destinationConfig[selectedDestination].color,
                            darkenColor(destinationConfig[selectedDestination].color, 0.3),
                        ]}
                    />
                    {hoveredValue !== null && (
                        <LegendIndicator $position={getIndicatorPosition(hoveredValue)} />
                    )}
                </LegendGradientContainer>
                <LegendLabels>
                    <span>0</span>
                    <span>{formatLegend(midHa)}</span>
                    <span>{formatLegend(maxHa)}</span>
                </LegendLabels>
            </LegendContainer>
        </BaseMap>
        </>
    );
};

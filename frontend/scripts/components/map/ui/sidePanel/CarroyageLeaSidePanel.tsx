import React, { useMemo } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { theme } from "@theme";
import { formatNumber } from "@utils/formatUtils";
import ChartDataTable from "@components/charts/ChartDataTable";
import { SidePanelPlaceholder, PlaceholderIcon, SidePanelContent, SidePanelHeader, HeaderContent, SidePanelTitle, SidePanelSubtitle } from "./SidePanelPrimitives";

type DestinationConfig = Record<string, { label: string; suffix: string; color: string; light_text: boolean }>;

const ColorSwatch = styled.span<{ $color: string }>`
	display: inline-block;
	width: 12px;
	height: 12px;
	border-radius: 3px;
	background-color: ${({ $color }) => $color};
	border: 1px solid ${theme.colors.border};
	flex-shrink: 0;
`;

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

function lerpColor(c1: string, c2: string, t: number): string {
	const [r1, g1, b1] = parseHex(c1);
	const [r2, g2, b2] = parseHex(c2);
	return toHex(
		Math.round(r1 + (r2 - r1) * t),
		Math.round(g1 + (g2 - g1) * t),
		Math.round(b1 + (b2 - b1) * t),
	);
}

const COLOR_STOPS: [number, number][] = [
	[0, 0],
	[100, 0.3],
	[500, 0.5],
	[1000, 0.7],
	[2500, 1],
	[5000, -0.3],
];

function buildColorStops(baseColor: string): [number, string][] {
	return COLOR_STOPS.map(([threshold, opacity]) => {
		if (opacity === 0) return [threshold, "#ffffff"];
		if (opacity < 0) return [threshold, darkenColor(baseColor, -opacity)];
		if (opacity === 1) return [threshold, baseColor];
		return [threshold, adjustColorOpacity(baseColor, opacity)];
	});
}

function getColorForValue(value: number, baseColor: string): string {
	const stops = buildColorStops(baseColor);
	if (value <= stops[0][0]) return stops[0][1];
	if (value >= stops.at(-1)![0]) return stops.at(-1)![1];
	for (let i = 0; i < stops.length - 1; i++) {
		if (value >= stops[i][0] && value < stops[i + 1][0]) {
			const t = (value - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
			return lerpColor(stops[i][1], stops[i + 1][1], t);
		}
	}
	return baseColor;
}

export interface CarroyageLeaSidePanelProps {
	feature: maplibregl.MapGeoJSONFeature | null;
	hoveredChildName: string | null;
	hoveredCoords: { lng: number; lat: number } | null;
	hoveredValue: number | null;
	destinationConfig: DestinationConfig;
	selectedDestination: string;
	startYear: number;
	endYear: number;
}

export const CarroyageLeaSidePanel: React.FC<CarroyageLeaSidePanelProps> = ({
	feature,
	hoveredChildName,
	hoveredCoords,
	hoveredValue,
	destinationConfig,
	selectedDestination,
	startYear,
	endYear,
}) => {
	const sidePanelData = useMemo(() => {
		if (!feature) return null;
		const props = feature.properties || {};
		const suffix = destinationConfig[selectedDestination].suffix;
		const minYear = Math.max(startYear, 2011);
		const maxYear = Math.min(endYear, 2023);
		const yearlyData: { year: number; valueHa: number; raw: number }[] = [];
		let total = 0;
		for (let year = minYear; year <= maxYear; year++) {
			const key = `conso_${year}${suffix}`;
			const value = typeof props[key] === "number" ? props[key] : 0;
			const valueHa = Math.round((value / 10000) * 100) / 100;
			total += value;
			yearlyData.push({ year, valueHa, raw: value });
		}
		const totalHa = Math.round((total / 10000) * 100) / 100;
		const fmt = (v: number) => formatNumber({ number: v, decimals: 2, addSymbol: true });
		const rows: Array<{ name: string; data: any[] }> = yearlyData.map(({ year, valueHa, raw }) => {
			if (raw !== 0) {
				return { name: "", data: [
					<strong key={`y-${year}`}>{year}</strong>,
					<strong key={`v-${year}`}>{fmt(valueHa)}</strong>,
				] };
			}
			return { name: "", data: [String(year), fmt(valueHa)] };
		});
		rows.push({ name: "", data: ["Total", fmt(totalHa)] });
		return {
			headers: ["Année", "Consommation (ha)"],
			rows,
			boldLastRow: true,
		};
	}, [feature, destinationConfig, selectedDestination, startYear, endYear]);

	if (!sidePanelData && !hoveredChildName) {
		return (
			<SidePanelPlaceholder>
				<PlaceholderIcon><i className="bi bi-hand-index" /></PlaceholderIcon>
				Survolez une cellule sur la carte pour afficher le détail de la consommation
			</SidePanelPlaceholder>
		);
	}

	return (
		<>
			{(hoveredChildName || hoveredValue !== null) && (
				<SidePanelHeader>
					<HeaderContent>
						{hoveredChildName && <SidePanelTitle>{hoveredChildName}</SidePanelTitle>}
						{hoveredCoords && (
							<SidePanelSubtitle>{hoveredCoords.lat.toFixed(5)}, {hoveredCoords.lng.toFixed(5)}</SidePanelSubtitle>
						)}
					</HeaderContent>
					{hoveredValue !== null && (
						<ColorSwatch $color={getColorForValue(hoveredValue, destinationConfig[selectedDestination].color)} />
					)}
				</SidePanelHeader>
			)}
			<SidePanelContent>
				{sidePanelData && (
					<ChartDataTable
						title={`Consommation - ${destinationConfig[selectedDestination].label}`}
						compact
						data={sidePanelData}
					/>
				)}
			</SidePanelContent>
		</>
	);
};

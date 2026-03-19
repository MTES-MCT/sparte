import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import { formatNumber } from "@utils/formatUtils";
import type { CompositionItem, SurfaceUnit } from "./types";

const PieChartContainer = styled.div`
	display: flex;
	align-items: flex-start;
	gap: ${theme.spacing.sm};
	width: 100%;
`;

const PieSvgWrapper = styled.div`
	flex: 0 0 27%;
	max-width: 27%;
	aspect-ratio: 1;
`;

const LegendList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 3px;
	flex: 1;
	min-width: 0;
`;

const LegendItem = styled.div`
	display: flex;
	align-items: flex-start;
	gap: ${theme.spacing.xs};
	font-size: ${theme.fontSize.xs};
	line-height: 1.3;
	color: ${theme.colors.text};

	> span:last-child {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
`;

const LegendColor = styled.span<{ $color: string }>`
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 2px;
	background-color: ${({ $color }) => $color};
	flex-shrink: 0;
	margin-top: 2px;
`;

export const FluxLabel = styled.span<{ $positive?: boolean }>`
	font-size: ${theme.fontSize.xs};
	font-weight: ${theme.fontWeight.semibold};
	color: ${({ $positive }) => ($positive ? theme.colors.error : theme.colors.success)};
`;

function PieChart({
	items,
	colorMap,
}: Readonly<{
	items: Array<{ code: string; percent: number }>;
	colorMap: Record<string, string>;
}>) {
	const viewBox = 100;
	const cx = viewBox / 2;
	const cy = viewBox / 2;
	const r = viewBox / 2 - 2;

	let cumulativePercent = 0;

	const slices = items.map((item) => {
		const startAngle = cumulativePercent * 3.6 * (Math.PI / 180);
		cumulativePercent += item.percent;
		const endAngle = cumulativePercent * 3.6 * (Math.PI / 180);

		const x1 = cx + r * Math.sin(startAngle);
		const y1 = cy - r * Math.cos(startAngle);
		const x2 = cx + r * Math.sin(endAngle);
		const y2 = cy - r * Math.cos(endAngle);

		const largeArc = item.percent > 50 ? 1 : 0;

		if (item.percent >= 99.9) {
			return (
				<circle
					key={item.code}
					cx={cx}
					cy={cy}
					r={r}
					fill={colorMap[item.code] || "#ccc"}
				/>
			);
		}

		const d = [
			`M ${cx} ${cy}`,
			`L ${x1} ${y1}`,
			`A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
			"Z",
		].join(" ");

		return (
			<path
				key={item.code}
				d={d}
				fill={colorMap[item.code] || "#ccc"}
			/>
		);
	});

	return (
		<svg viewBox={`0 0 ${viewBox} ${viewBox}`} style={{ width: "100%", height: "100%", maxWidth: "100%" }}>
			{slices}
		</svg>
	);
}

export function renderPieChart(
	items: CompositionItem[],
	labelFn: (code: string) => string,
	colorMap: Record<string, string>,
	fluxItems?: CompositionItem[],
	surfaceUnit: SurfaceUnit = "ha",
): React.ReactNode {
	if (items.length === 0) return null;

	const totalSurface = items.reduce((acc, item) => acc + item.surface, 0);
	if (totalSurface === 0) return null;

	const fluxByCode = new Map<string, CompositionItem>();
	if (fluxItems) {
		for (const item of fluxItems) {
			fluxByCode.set(item.code, item);
		}
	}

	const withPercent = items
		.map((item) => ({
			code: item.code,
			percent: (item.surface / totalSurface) * 100,
		}))
		.filter((item) => item.percent >= 0.5);

	const stockCodes = new Set(withPercent.map((item) => item.code));
	const fluxOnlyCodes = fluxItems
		? fluxItems.filter((item) => !stockCodes.has(item.code) && item.surface !== 0)
		: [];

	const unitLabel = surfaceUnit === "ha" ? "ha" : "m²";

	return (
		<PieChartContainer>
			<PieSvgWrapper>
				<PieChart items={withPercent} colorMap={colorMap} />
			</PieSvgWrapper>
			<LegendList>
				{withPercent.map((item) => {
					const flux = fluxByCode.get(item.code);
					const fluxVal = flux ? (surfaceUnit === "ha" ? flux.surface / 10000 : flux.surface) : 0;
					return (
						<LegendItem key={item.code}>
							<LegendColor $color={colorMap[item.code] || "#ccc"} />
							<span>
								{formatNumber({ number: item.percent, decimals: 2 })}% {labelFn(item.code)}
								{fluxItems && fluxVal !== 0 && (
									<FluxLabel $positive={fluxVal > 0}> {fluxVal > 0 ? "+" : "-"}{formatNumber({ number: Math.abs(fluxVal), decimals: 2 })} {unitLabel}</FluxLabel>
								)}
							</span>
						</LegendItem>
					);
				})}
				{fluxOnlyCodes.map((item) => {
					const fluxVal = surfaceUnit === "ha" ? item.surface / 10000 : item.surface;
					return (
						<LegendItem key={item.code}>
							<LegendColor $color={colorMap[item.code] || "#ccc"} />
							<span>
								0% {labelFn(item.code)}
								<FluxLabel $positive={fluxVal > 0}> {fluxVal > 0 ? "+" : "-"}{formatNumber({ number: Math.abs(fluxVal), decimals: 2 })} {unitLabel}</FluxLabel>
							</span>
						</LegendItem>
					);
				})}
			</LegendList>
		</PieChartContainer>
	);
}

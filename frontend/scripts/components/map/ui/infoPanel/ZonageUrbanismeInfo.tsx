import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import type maplibregl from "maplibre-gl";
import { InfoContent } from "./InfoContent";
import { InfoRow } from "./InfoRow";
import { InfoLabel } from "./InfoLabel";
import { InfoValue } from "./InfoValue";
import { ZonageType } from "scripts/types/ZonageType";
import { getCouvertureLabel, getUsageLabel } from "../../utils/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS } from "../../constants/ocsge_nomenclatures";
import type { ZonageUrbanismeMode } from "../../layers/zonageUrbanismeLayer";

interface CompositionItem {
    code: string;
    surface: number;
}

const SectionTitle = styled.div`
    font-weight: 600;
    font-size: 0.65rem;
    color: #333;
    margin-top: 8px;
    margin-bottom: 4px;
`;

const PieChartContainer = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
`;

const LegendList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.58rem;
    line-height: 1.2;
`;

const LegendColor = styled.span<{ $color: string }>`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 1px;
    background-color: ${({ $color }) => $color};
    flex-shrink: 0;
`;

interface ZonageUrbanismeInfoProps {
    feature: maplibregl.MapGeoJSONFeature;
    mode: ZonageUrbanismeMode;
}

function parseComposition(raw: unknown): CompositionItem[] {
    if (!raw) return [];
    try {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!Array.isArray(data)) return [];
        return data as CompositionItem[];
    } catch {
        return [];
    }
}

function PieChart({
    items,
    colorMap,
    size = 70,
}: {
    items: Array<{ code: string; percent: number }>;
    colorMap: Record<string, string>;
    size?: number;
}) {
    const radius = size / 2;
    const cx = radius;
    const cy = radius;
    const r = radius - 2;

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

        // Full circle case
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
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
            {slices}
        </svg>
    );
}

function renderPieChart(
    items: CompositionItem[],
    labelFn: (code: string) => string,
    colorMap: Record<string, string>,
): React.ReactNode {
    if (items.length === 0) return null;

    const totalSurface = items.reduce((acc, item) => acc + item.surface, 0);
    if (totalSurface === 0) return null;

    const withPercent = items
        .map((item) => ({
            code: item.code,
            percent: (item.surface / totalSurface) * 100,
        }))
        .filter((item) => item.percent >= 0.5);

    return (
        <PieChartContainer>
            <PieChart items={withPercent} colorMap={colorMap} />
            <LegendList>
                {withPercent.map((item) => (
                    <LegendItem key={item.code}>
                        <LegendColor $color={colorMap[item.code] || "#ccc"} />
                        <span>{formatNumber({ number: item.percent })}% {labelFn(item.code)}</span>
                    </LegendItem>
                ))}
            </LegendList>
        </PieChartContainer>
    );
}

export const ZonageUrbanismeInfo: React.FC<ZonageUrbanismeInfoProps> = ({ feature, mode }) => {
    const properties = feature?.properties;

    if (!properties) {
        return (
            <InfoContent>
                <InfoRow>
                    <InfoLabel>Information</InfoLabel>
                    <InfoValue>Aucune donnée disponible</InfoValue>
                </InfoRow>
            </InfoContent>
        );
    }

    const typeZone = properties.type_zone as string;
    const libelle = properties.libelle as string;
    const zonageSurface = properties.zonage_surface as number;
    const zonageSurfaceHa = zonageSurface ? zonageSurface / 10000 : 0;

    const percentField = mode === "artif" ? "artif_percent" : "imper_percent";
    const surfaceField = mode === "artif" ? "artif_surface" : "imper_surface";
    const percent = properties[percentField] as number | null;
    const surface = properties[surfaceField] as number | null;
    const surfaceHa = surface ? surface / 10000 : null;

    const modeLabel = mode === "artif" ? "artificialisation" : "imperméabilisation";

    const couvertureField = mode === "artif" ? "artif_couverture_composition" : "imper_couverture_composition";
    const usageField = mode === "artif" ? "artif_usage_composition" : "imper_usage_composition";
    const couvertureItems = parseComposition(properties[couvertureField]);
    const usageItems = parseComposition(properties[usageField]);

    return (
        <InfoContent>
            <InfoRow>
                <InfoLabel>Type de zone</InfoLabel>
                <InfoValue>{ZonageType[typeZone as keyof typeof ZonageType] || typeZone} ({typeZone})</InfoValue>
            </InfoRow>
            {libelle && (
                <InfoRow>
                    <InfoLabel>Libellé</InfoLabel>
                    <InfoValue>{libelle}</InfoValue>
                </InfoRow>
            )}
            <InfoRow>
                <InfoLabel>Surface du zonage</InfoLabel>
                <InfoValue>
                    {zonageSurface ? `${formatNumber({ number: zonageSurfaceHa })} ha` : "Non renseigné"}
                </InfoValue>
            </InfoRow>
            <InfoRow>
                <InfoLabel>Taux d'{modeLabel}</InfoLabel>
                <InfoValue>
                    {percent != null ? `${formatNumber({ number: percent })} %` : "Non disponible"}
                </InfoValue>
            </InfoRow>
            <InfoRow>
                <InfoLabel>Surface {mode === "artif" ? "artificialisée" : "imperméable"}</InfoLabel>
                <InfoValue>
                    {surfaceHa != null ? `${formatNumber({ number: surfaceHa })} ha` : "Non disponible"}
                </InfoValue>
            </InfoRow>

            {couvertureItems.length > 0 && (
                <>
                    <SectionTitle>Couverture du sol</SectionTitle>
                    {renderPieChart(couvertureItems, getCouvertureLabel, COUVERTURE_COLORS as Record<string, string>)}
                </>
            )}

            {usageItems.length > 0 && (
                <>
                    <SectionTitle>Usage du sol</SectionTitle>
                    {renderPieChart(usageItems, getUsageLabel, USAGE_COLORS as Record<string, string>)}
                </>
            )}
        </InfoContent>
    );
};

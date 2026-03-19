import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import { formatNumber } from "@utils/formatUtils";
import Badge from "@components/ui/Badge";

interface BulletChartMarker {
  value: number;
  label: string;
  variant: "target" | "custom";
}

interface TrajectoiresBulletChartProps {
  referenceValue: number;
  referenceLabel: string;
  currentValue: number;
  currentLabel: string;
  markers: BulletChartMarker[];
  unit?: string;
  className?: string;
}

const variantConfig = {
  reference: {
    color: theme.colors.textMuted,
    bg: theme.colors.backgroundMuted,
  },
  current: {
    color: theme.colors.primary,
    bg: theme.colors.primaryBg,
  },
  target: {
    color: theme.colors.success,
    bg: theme.colors.successBg,
  },
  custom: {
    color: theme.colors.purple,
    bg: theme.colors.purpleBg,
  },
};

const Card = styled(BaseCard)`
  padding: 1.25rem 1.5rem;
`;

const Title = styled.div`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
  margin-bottom: 1.25rem;
`;

const ChartContainer = styled.div`
  position: relative;
  height: 40px;
`;

const AxisWrapper = styled.div`
  position: relative;
  height: 1.5rem;
  margin-bottom: 1rem;
`;

const AxisTickWrapper = styled.div<{ $position: number }>`
  position: absolute;
  left: ${({ $position }) => $position}%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;

  &::before {
    content: "";
    display: block;
    width: 1px;
    height: 6px;
    background: ${theme.colors.border};
    flex-shrink: 0;
  }
`;

const AxisTickLabel = styled.span`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textLight};
  margin-top: 0.25rem;
`;

const ReferenceBar = styled.div<{ $width: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${variantConfig.reference.bg};
  border-radius: 6px;
`;

const CurrentBar = styled.div<{ $width: number }>`
  position: absolute;
  top: 8px;
  left: 0;
  height: 24px;
  width: ${({ $width }) => Math.max($width, 1)}%;
  background: ${variantConfig.current.color};
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Marker = styled.div<{ $position: number; $color: string }>`
  position: absolute;
  top: 4px;
  left: ${({ $position }) => $position}%;
  width: 9px;
  height: 32px;
  background: ${({ $color }) => $color};
  border-radius: 2px;
  transform: translateX(-50%);
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const LegendItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendDot = styled.span<{ $color: string; $isMarker?: boolean }>`
  width: ${({ $isMarker }) => ($isMarker ? "4px" : "12px")};
  height: 12px;
  border-radius: ${({ $isMarker }) => ($isMarker ? "2px" : "3px")};
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const LegendLabel = styled.span`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textLight};
`;

export const TrajectoiresBulletChart: React.FC<TrajectoiresBulletChartProps> = ({
  referenceValue,
  referenceLabel,
  currentValue,
  currentLabel,
  markers,
  unit = "ha/an",
  className,
}) => {
  const allValues = [referenceValue, currentValue, ...markers.map((m) => m.value)];
  const maxValue = Math.max(...allValues, 0.001);
  const scale = 100 / maxValue;

  const targetTickCount = 8;
  const rawStep = maxValue / targetTickCount;
  const exp = Math.floor(Math.log10(rawStep || 1e-10));
  const mantissa = rawStep / 10 ** exp;
  const niceMantissa = mantissa <= 1 ? 1 : mantissa <= 2 ? 2 : mantissa <= 5 ? 5 : 10;
  const step = niceMantissa * 10 ** exp;
  const decimals = 1;
  const roundTick = (x: number) => Math.round(x * 10 ** decimals) / 10 ** decimals;
  const ticks: number[] = [];
  for (let i = 0; ; i++) {
    const v = roundTick(i * step);
    if (v > maxValue + step * 0.01) break;
    if (ticks.length === 0 || v > ticks[ticks.length - 1]) ticks.push(v);
  }
  if (ticks.length > 12) {
    const stepIndex = Math.ceil(ticks.length / 10);
    const filtered = ticks.filter((_, i) => i % stepIndex === 0 || i === ticks.length - 1);
    ticks.length = 0;
    ticks.push(...filtered);
  }

  const referenceWidth = referenceValue * scale;
  const currentWidth = currentValue * scale;

  return (
    <Card className={className}>
      <Title>Comparaison des rythmes de consommation annuelle</Title>
      <ChartContainer>
        <ReferenceBar $width={referenceWidth} />
        <CurrentBar $width={currentWidth} />
        {markers.map((marker, index) => {
          const position = marker.value * scale;
          const config = variantConfig[marker.variant];
          return (
            <Marker
              key={index}
              $position={position}
              $color={config.color}
            />
          );
        })}
      </ChartContainer>
      <AxisWrapper>
        {ticks.map((value, index) => (
          <AxisTickWrapper key={index} $position={(value / maxValue) * 100}>
            <AxisTickLabel>
              {formatNumber({ number: value, decimals: value === 0 ? 0 : decimals })}
            </AxisTickLabel>
          </AxisTickWrapper>
        ))}
      </AxisWrapper>
      <Legend>
        <LegendItem>
          <LegendItemRow>
            <LegendDot $color={variantConfig.reference.bg} />
            <LegendLabel>{referenceLabel}</LegendLabel>
          </LegendItemRow>
          <div><Badge variant="neutral" size="sm"><strong>{formatNumber({ number: referenceValue })} {unit}</strong></Badge></div>
        </LegendItem>
        <LegendItem>
          <LegendItemRow>
            <LegendDot $color={variantConfig.current.color} />
            <LegendLabel>{currentLabel}</LegendLabel>
          </LegendItemRow>
          <div><Badge variant="primary" size="sm"><strong>{formatNumber({ number: currentValue })} {unit}</strong></Badge></div>
        </LegendItem>
        {markers.map((marker, index) => (
          <LegendItem key={index}>
            <LegendItemRow>
              <LegendDot $color={variantConfig[marker.variant].color} $isMarker />
              <LegendLabel>{marker.label}</LegendLabel>
            </LegendItemRow>
            <div><Badge variant={marker.variant === "target" ? "success" : "highlight"} size="sm"><strong>{formatNumber({ number: marker.value })} {unit}</strong></Badge></div>
          </LegendItem>
        ))}
      </Legend>
    </Card>
  );
};

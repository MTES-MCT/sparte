import React, { useState } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import { BivariateLegendProps } from "./types";
import BaseCard from "@components/ui/BaseCard";
import Badge from "@components/ui/Badge";
import IconBadge from "@components/ui/IconBadge";

const CONSO_QUALIF = ["Faible", "Moyenne", "Forte"];
const LEVEL_ICONS = ["bi-arrow-down", "bi-dash", "bi-arrow-up"];

const LegendCard = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const Header = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  flex-shrink: 0;
`;

const Title = styled.h4`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const GridSection = styled.div`
  padding: ${theme.spacing.md};
  flex-shrink: 0;
`;

const MainContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  gap: ${theme.spacing.sm};
`;

const YAxisTitle = styled.div`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: right;
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: 1fr auto auto;
  gap: 0;
  flex: 1;
  min-width: 0;
`;

const YAxisLabels = styled.div`
  grid-column: 1;
  grid-row: 1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  justify-items: center;
  align-items: center;
  padding-right: ${theme.spacing.md};
  row-gap: ${theme.spacing.md};
`;

const YAxisLabel = styled.span`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textMuted};
  font-weight: ${theme.fontWeight.medium};
  line-height: 1;
`;

const YAxisArrow = styled.div`
  position: relative;
  width: 1px;
  height: 100%;
  justify-self: center;
  align-self: stretch;
  background: ${theme.colors.textMuted};

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    width: 6px;
    height: 6px;
    border-top: 1px solid ${theme.colors.textMuted};
    border-right: 1px solid ${theme.colors.textMuted};
    transform: translate(-50%, -1px) rotate(-45deg);
  }
`;

const GridWrapper = styled.div`
  grid-column: 2;
  grid-row: 1;
  display: grid;
  grid-template-rows: repeat(3, auto);
  gap: 3px;
  width: 100%;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 3px;
`;

const Cell = styled.div<{ $color: string; $highlighted?: boolean }>`
  width: 100%;
  height: clamp(32px, 8vw, 55px);
  border-radius: 6px;
  background: ${({ $color }) => $color};
  border: none;
  transition: filter 0.15s ease, transform 0.2s ease;
  transform: ${({ $highlighted }) => $highlighted ? 'scale(.95)' : 'scale(1)'};
  filter: ${({ $highlighted }) => $highlighted ? 'brightness(1.1)' : 'none'};

  &:hover {
    filter: brightness(1.1);
  }
`;

const XAxisLabels = styled.div`
  grid-column: 2;
  grid-row: 2;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const XAxisLabel = styled.span`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textMuted};
  font-weight: ${theme.fontWeight.medium};
  line-height: 1;
`;

const XAxisArrow = styled.div`
  position: relative;
  width: 100%;
  height: 1px;
  align-self: center;
  background: ${theme.colors.textMuted};

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    width: 6px;
    height: 6px;
    border-top: 1px solid ${theme.colors.textMuted};
    border-right: 1px solid ${theme.colors.textMuted};
    transform: translateY(-50%) rotate(45deg);
  }
`;

const XAxisTitle = styled.div`
  grid-column: 2;
  grid-row: 3;
  text-align: center;
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
  margin-top: ${theme.spacing.xs};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DetailPanel = styled.div<{ $bgColor: string }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${({ $bgColor }) => $bgColor};
  border-top: 1px solid ${theme.colors.border};
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const DetailSwatch = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
`;

const DetailTitle = styled.div`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
  line-height: 1.3;
`;

const MetricList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

const MetricLabel = styled.div`
  display: flex;
  align-items: start;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSize.xs};
  flex: 1;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.md};
`;

const EmptyIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: ${theme.spacing.sm};
  opacity: 0.5;
`;

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const BivariateLegend: React.FC<BivariateLegendProps> = ({
  colorGrid,
  consoLabel,
  consoRanges,
  indicName,
  indicUnit,
  indicRanges,
  indicQualif,
  highlightedCell,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const activeCell = hoveredCell ?? highlightedCell ?? null;

  const getDetailBgColor = () => {
    if (!activeCell) return theme.colors.backgroundAlt;
    const color = colorGrid[activeCell.row]?.[activeCell.col];
    return color ? hexToRgba(color, 0.12) : theme.colors.backgroundAlt;
  };

  const renderDetail = () => {
    if (!activeCell) {
      return (
        <EmptyState>
          <EmptyIcon><i className="bi bi-hand-index" /></EmptyIcon>
          Survolez une case pour voir le détail
        </EmptyState>
      );
    }

    const { row, col } = activeCell;
    const color = colorGrid[row]?.[col] || theme.colors.textMuted;
    const consoQualif = CONSO_QUALIF[row];
    const indicQualifText = indicQualif[col];

    const consoDisplay = consoRanges ? `${consoRanges[row]} %` : consoQualif;
    const indicDisplay = indicRanges 
      ? `${indicRanges[col]}${indicUnit ? ` ${indicUnit}` : ""}` 
      : indicQualifText.split(" ").pop();

    return (
      <>
        <DetailHeader>
          <DetailSwatch $color={color} />
          <DetailTitle>
            Consommation {consoQualif.toLowerCase()}, {indicName.toLowerCase()} {indicQualifText.split(" ").pop()}
          </DetailTitle>
        </DetailHeader>

        <MetricList>
          <MetricRow>
            <MetricLabel>
              <IconBadge icon={`bi ${LEVEL_ICONS[row]}`} size={22} variant="light" />
              <span>{consoLabel}</span>
            </MetricLabel>
            <Badge variant="primary" size="sm">{consoDisplay}</Badge>
          </MetricRow>

          <MetricRow>
            <MetricLabel>
              <IconBadge icon={`bi ${LEVEL_ICONS[col]}`} size={22} variant="light" />
              <span>{indicName}</span>
            </MetricLabel>
            <Badge variant="primary" size="sm">{indicDisplay}</Badge>
          </MetricRow>
        </MetricList>

      </>
    );
  };

  return (
    <LegendCard>
      <CardContent>
        <Header>
          <Title>Légende</Title>
        </Header>

        <GridSection>
          <MainContainer>
            <YAxisTitle>{consoLabel} (%)</YAxisTitle>

            <GridLayout>
              <YAxisLabels>
                <YAxisLabel>Faible</YAxisLabel>
                <YAxisArrow aria-hidden="true" />
                <YAxisLabel>Élevée</YAxisLabel>
              </YAxisLabels>

              <GridWrapper>
                {colorGrid.map((colors, rowIndex) => (
                  <GridRow key={rowIndex}>
                    {colors.map((color, colIndex) => (
                      <Cell
                        key={`${rowIndex}-${colIndex}`}
                        $color={color}
                        $highlighted={activeCell?.row === rowIndex && activeCell?.col === colIndex}
                        onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    ))}
                  </GridRow>
                ))}
              </GridWrapper>

              <XAxisLabels>
                <XAxisLabel>Faible</XAxisLabel>
                <XAxisArrow aria-hidden="true" />
                <XAxisLabel>Élevé</XAxisLabel>
              </XAxisLabels>

              <XAxisTitle>{indicName}{indicUnit ? ` (${indicUnit})` : ""}</XAxisTitle>
            </GridLayout>
          </MainContainer>
        </GridSection>

        <DetailPanel $bgColor={getDetailBgColor()}>
          {renderDetail()}
        </DetailPanel>
      </CardContent>
    </LegendCard>
  );
};

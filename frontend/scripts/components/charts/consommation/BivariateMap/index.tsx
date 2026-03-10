import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import GenericChart, { DataSource } from "@components/charts/GenericChart";
import Button from "@components/ui/Button";
import { useGetChartConfigQuery } from "@services/api";
import { BivariateLegend } from "./BivariateLegend";
import { BivariateMapProps, MapDrilldown, MapNavEntry } from "./types";

const CHILD_LAND_TYPE_MAP: Record<string, string> = {
  REGION: "DEPART",
  DEPART: "EPCI",
  SCOT: "COMM",
  EPCI: "COMM",
};

const SOURCES: DataSource[] = ["insee", "majic"];

const formatNumber = (v: number) => Number.parseFloat(v.toFixed(2)).toString();

const formatIndicator = (v: number, unit: string) => {
  if (unit === "%") return v > 0 ? `+${formatNumber(v)}` : formatNumber(v);
  return formatNumber(v);
};

export function useMapDrilldown(childLandType: string): MapDrilldown {
  const [navStack, setNavStack] = useState<MapNavEntry[]>([]);

  useEffect(() => {
    setNavStack([]);
  }, [childLandType]);

  const push = useCallback((entry: MapNavEntry) => {
    setNavStack((prev) => [...prev, entry]);
  }, []);

  const navigateTo = useCallback((index: number) => {
    setNavStack((prev) => prev.slice(0, index));
  }, []);

  return { navStack, push, navigateTo };
}

export const BivariateMap: React.FC<BivariateMapProps> = ({
  chartId,
  landId,
  landType,
  landName,
  childLandType,
  startYear = 2011,
  endYear = 2022,
  drilldown: externalDrilldown,
  showMailleIndicator = false,
}) => {
  const internalDrilldown = useMapDrilldown(childLandType);
  const drilldown = externalDrilldown ?? internalDrilldown;

  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const hoveredCellRef = useRef(hoveredCell);

  const currentEntry = drilldown.navStack.at(-1) ?? null;
  const mapLandId = currentEntry?.land_id ?? landId;
  const mapLandType = currentEntry?.land_type ?? landType;
  const mapChildLandType = currentEntry?.child_land_type ?? childLandType;

  const handleMapPointClick = useCallback(
    (point: { land_id: string; land_type: string; name: string }) => {
      const pointLandType = point.land_type || mapChildLandType;
      const nextChildType = CHILD_LAND_TYPE_MAP[pointLandType];
      if (!nextChildType) return;
      drilldown.push({
        land_id: point.land_id,
        land_type: pointLandType,
        name: point.name,
        child_land_type: nextChildType,
      });
    },
    [mapChildLandType, drilldown]
  );

  const { data: config } = useGetChartConfigQuery({
    id: chartId,
    land_type: mapLandType,
    land_id: mapLandId,
    child_land_type: mapChildLandType,
    start_date: String(startYear),
    end_date: String(endYear),
  });

  const custom = config?.highcharts_options?.custom;

  const bivariateConfig = useMemo(() => {
    if (!custom) return null;

    const consoT1 = custom.conso_t1;
    const consoT2 = custom.conso_t2;
    const indicT1 = custom.indic_t1;
    const indicT2 = custom.indic_t2;
    const consoMin = custom.conso_min;
    const consoMax = custom.conso_max;
    const indicMin = custom.indic_min;
    const indicMax = custom.indic_max;
    const consoLabel = custom.conso_label || "Consommation";
    const indicName = custom.indicator_name || "Indicateur";
    const indicUnit = custom.indicator_unit || "";
    const indicGender = custom.indicator_gender || "m";
    const colorGrid: string[][] | null = custom.colors || null;

    const fem = indicGender === "f";
    const adj = { faible: "faible", moyen: fem ? "moyenne" : "moyen", fort: fem ? "forte" : "fort" };

    const cMin = consoMin == null ? "0" : formatNumber(consoMin);
    const cMax = consoMax == null ? "∞" : formatNumber(consoMax);
    const iMin = indicMin == null ? "−∞" : formatIndicator(indicMin, indicUnit);
    const iMax = indicMax == null ? "+∞" : formatIndicator(indicMax, indicUnit);

    const consoRanges =
      consoT1 != null && consoT2 != null
        ? [
            `[${cMin}, ${formatNumber(consoT1)}]`,
            `]${formatNumber(consoT1)}, ${formatNumber(consoT2)}]`,
            `]${formatNumber(consoT2)}, ${cMax}]`,
          ]
        : null;

    const indicRanges =
      indicT1 != null && indicT2 != null
        ? [
            `[${iMin}, ${formatIndicator(indicT1, indicUnit)}]`,
            `]${formatIndicator(indicT1, indicUnit)}, ${formatIndicator(indicT2, indicUnit)}]`,
            `]${formatIndicator(indicT2, indicUnit)}, ${iMax}]`,
          ]
        : null;

    const indicQualif = [
      `${indicName} ${adj.faible}`,
      `${indicName} ${adj.moyen}`,
      `${indicName} ${adj.fort}`,
    ];

    return {
      consoLabel,
      consoRanges,
      indicName,
      indicUnit,
      indicRanges,
      indicQualif,
      colorGrid,
      adjectives: adj,
    };
  }, [custom]);

  const chartParams = useMemo(
    () => ({ child_land_type: mapChildLandType, start_date: String(startYear), end_date: String(endYear) }),
    [mapChildLandType, startYear, endYear]
  );
  const colorGridRef = useRef(bivariateConfig?.colorGrid);
  colorGridRef.current = bivariateConfig?.colorGrid;

  const handlePointHover = useCallback(
    (point: { color: string; name: string; value: number } | null) => {
      const colorGrid = colorGridRef.current;
      if (!point || !colorGrid) {
        if (hoveredCellRef.current !== null) {
          hoveredCellRef.current = null;
          setHoveredCell(null);
        }
        return;
      }
      const normalizedColor = point.color.toLowerCase();
      for (let row = 0; row < colorGrid.length; row++) {
        for (let col = 0; col < colorGrid[row].length; col++) {
          if (colorGrid[row][col].toLowerCase() === normalizedColor) {
            if (hoveredCellRef.current?.row !== row || hoveredCellRef.current?.col !== col) {
              hoveredCellRef.current = { row, col };
              setHoveredCell({ row, col });
            }
            return;
          }
        }
      }
      if (hoveredCellRef.current !== null) {
        hoveredCellRef.current = null;
        setHoveredCell(null);
      }
    },
    []
  );

  return (
    <div className="fr-mb-5w">
      {drilldown.navStack.length > 0 && (
        <nav className="fr-mb-1w" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} aria-label="Fil d'ariane de la carte">
          <i className="bi bi-geo-alt" aria-hidden="true" style={{ opacity: 0.4, fontSize: "0.85rem" }} />
          <Button variant="tertiary" noBackground noPadding size="sm" onClick={() => drilldown.navigateTo(0)}>
            {landName || landId}
          </Button>
          {drilldown.navStack.map((entry, i) => (
            <React.Fragment key={entry.land_id}>
              <span aria-hidden="true" style={{ opacity: 0.4 }}>/</span>
              {i < drilldown.navStack.length - 1 ? (
                <Button variant="tertiary" noBackground noPadding size="sm" onClick={() => drilldown.navigateTo(i + 1)}>
                  {entry.name}
                </Button>
              ) : (
                <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{entry.name}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-8 fr-grid-row">
          <GenericChart
            key={`${chartId}-${mapLandId}-${mapChildLandType}-${startYear}-${endYear}`}
            id={chartId}
            land_id={mapLandId}
            land_type={mapLandType}
            params={chartParams}
            sources={SOURCES}
            showDataTable={true}
            isMap={true}
            showMailleIndicator={showMailleIndicator}
            onPointClick={CHILD_LAND_TYPE_MAP[mapChildLandType] ? handleMapPointClick : undefined}
            onPointHover={handlePointHover}
          />
        </div>

        {bivariateConfig?.colorGrid && (
          <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
            <BivariateLegend
              colorGrid={bivariateConfig.colorGrid}
              consoLabel={bivariateConfig.consoLabel}
              consoRanges={bivariateConfig.consoRanges}
              indicName={bivariateConfig.indicName}
              indicUnit={bivariateConfig.indicUnit}
              indicRanges={bivariateConfig.indicRanges}
              indicQualif={bivariateConfig.indicQualif}
              adjectives={bivariateConfig.adjectives}
              highlightedCell={hoveredCell}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export type { BivariateMapProps, MapDrilldown } from "./types";

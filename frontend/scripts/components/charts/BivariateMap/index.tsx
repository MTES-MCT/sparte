import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import GenericChart from "@components/charts/GenericChart";
import { getLandTypeLabel } from "@utils/landUtils";
import { useGetChartConfigQuery } from "@services/api";
import { theme } from "@theme";
import { BivariateLegend } from "./BivariateLegend";
import { BivariateMapProps } from "./types";

const PERIODS = [
  { value: "2011_2016", label: "2011 - 2016" },
  { value: "2016_2022", label: "2016 - 2022" },
];

const CHILD_LAND_TYPE_MAP: Record<string, string> = {
  REGION: "DEPART",
  DEPART: "EPCI",
  SCOT: "COMM",
  EPCI: "COMM",
};

const styles = {
  buttonGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexWrap: "wrap" as const,
  },
  separator: {
    borderLeft: `1px solid ${theme.colors.border}`,
    height: 24,
  },
} as const;

const formatNumber = (v: number) => parseFloat(v.toFixed(2)).toString();

const formatIndicator = (v: number, unit: string) => {
  if (unit === "%") return v > 0 ? `+${formatNumber(v)}` : formatNumber(v);
  return formatNumber(v);
};

export const BivariateMap: React.FC<BivariateMapProps> = ({
  chartId,
  landId,
  landType,
  landName,
  childLandType,
  childLandTypes,
  onChildLandTypeChange,
}) => {
  const [period, setPeriod] = useState("2016_2022");

  const [mapNavStack, setMapNavStack] = useState<
    { land_id: string; land_type: string; name: string; child_land_type: string }[]
  >([]);

  const currentMapLand = mapNavStack.length > 0 ? mapNavStack[mapNavStack.length - 1] : null;
  const mapLandId = currentMapLand?.land_id ?? landId;
  const mapLandType = currentMapLand?.land_type ?? landType;
  const mapChildLandType = currentMapLand?.child_land_type ?? childLandType;

  const handleMapPointClick = useCallback(
    (point: { land_id: string; land_type: string; name: string }) => {
      const pointLandType = point.land_type || mapChildLandType;
      const nextChildType = CHILD_LAND_TYPE_MAP[pointLandType];
      if (!nextChildType) return;
      setMapNavStack((prev) => [
        ...prev,
        {
          land_id: point.land_id,
          land_type: pointLandType,
          name: point.name,
          child_land_type: nextChildType,
        },
      ]);
    },
    [mapChildLandType]
  );

  const handleMapBreadcrumbClick = useCallback((index: number) => {
    setMapNavStack((prev) => prev.slice(0, index));
  }, []);

  useEffect(() => {
    setMapNavStack([]);
  }, [childLandType]);

  const handleChildLandTypeChange = useCallback(
    (type: string) => {
      onChildLandTypeChange?.(type);
    },
    [onChildLandTypeChange]
  );

  const { data: config } = useGetChartConfigQuery({
    id: chartId,
    land_type: mapLandType,
    land_id: mapLandId,
    child_land_type: mapChildLandType,
    period,
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
    const verdicts: string[][] = custom.verdicts || [["", "", ""], ["", "", ""], ["", "", ""]];
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
      verdicts,
      colorGrid,
      adjectives: adj,
    };
  }, [custom]);

  return (
    <div className="fr-mb-5w">
      <div className="fr-mb-2w" style={styles.buttonGroup}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={`fr-btn ${period === p.value ? "fr-btn--primary" : "fr-btn--tertiary"} fr-btn--sm`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
        {childLandTypes && childLandTypes.length > 1 && (
          <>
            <span style={styles.separator} />
            {childLandTypes.map((clt) => (
              <button
                key={clt}
                className={`fr-btn ${childLandType === clt ? "fr-btn--primary" : "fr-btn--tertiary"} fr-btn--sm`}
                onClick={() => handleChildLandTypeChange(clt)}
              >
                {getLandTypeLabel(clt)}
              </button>
            ))}
          </>
        )}
      </div>

      {mapNavStack.length > 0 && (
        <Breadcrumb
          className="fr-mb-1w"
          segments={[
            {
              label: landName || landId,
              linkProps: {
                href: "#",
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  handleMapBreadcrumbClick(0);
                },
              },
            },
            ...mapNavStack.slice(0, -1).map((entry, i) => ({
              label: entry.name,
              linkProps: {
                href: "#",
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  handleMapBreadcrumbClick(i + 1);
                },
              },
            })),
          ]}
          currentPageLabel={mapNavStack[mapNavStack.length - 1].name}
        />
      )}

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-8 fr-grid-row">
          <GenericChart
            key={`${chartId}-${mapLandId}-${mapChildLandType}-${period}`}
            id={chartId}
            land_id={mapLandId}
            land_type={mapLandType}
            params={{ child_land_type: mapChildLandType, period }}
            sources={["insee", "majic"]}
            showDataTable={true}
            isMap={true}
            onPointClick={CHILD_LAND_TYPE_MAP[mapChildLandType] ? handleMapPointClick : undefined}
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
              verdicts={bivariateConfig.verdicts}
              adjectives={bivariateConfig.adjectives}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export type { BivariateMapProps } from "./types";

import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import GenericChart, { DataSource } from "@components/charts/GenericChart";
import Button from "@components/ui/Button";
import { useGetChartConfigQuery } from "@services/api";
import { BivariateLegend } from "./BivariateLegend";
import { BivariateMapProps, MapDrilldown, MapNavEntry } from "./types";
import { getLandTypeLabel } from "@utils/landUtils";

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

  const drilldownPush = drilldown.push;
  const handleMapPointClick = useCallback(
    (point: { land_id: string; land_type: string; name: string }) => {
      const pointLandType = point.land_type || mapChildLandType;
      const nextChildType = CHILD_LAND_TYPE_MAP[pointLandType];
      if (!nextChildType) return;
      drilldownPush({
        land_id: point.land_id,
        land_type: pointLandType,
        name: point.name,
        child_land_type: nextChildType,
      });
    },
    [mapChildLandType, drilldownPush]
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
      `${indicName} parmi les plus faibles`,
      `${indicName} intermédiaire`,
      `${indicName} parmi les plus élevées`,
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
  const handlePointHover = useCallback(
    (point: { color: string; name: string; value: number; pointOptions?: Record<string, any> } | null) => {
      if (!point) {
        if (hoveredCellRef.current !== null) {
          hoveredCellRef.current = null;
          setHoveredCell(null);
        }
        return;
      }

      const categoryId = point.pointOptions?.category_id;
      if (categoryId != null && typeof categoryId === "number") {
        const row = Math.floor(categoryId / 3);
        const col = categoryId % 3;
        if (hoveredCellRef.current?.row !== row || hoveredCellRef.current?.col !== col) {
          hoveredCellRef.current = { row, col };
          setHoveredCell({ row, col });
        }
        return;
      }

      if (hoveredCellRef.current !== null) {
        hoveredCellRef.current = null;
        setHoveredCell(null);
      }
    },
    []
  );

  const chartChildren = useMemo(() => (
    <div style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
      <p>
        Cette carte bivariée croise deux axes : la <strong>consommation d'espaces NAF</strong> (fichiers fonciers)
        et un <strong>indicateur socio-économique</strong> (INSEE, dossier complet). Chaque territoire est classé
        dans une grille 3×3 = 9 catégories, selon sa position sur chacun des deux axes.
      </p>
      <p>
        <strong>Méthode de classification : terciles nationaux.</strong><br />
        Pour chaque axe, l'ensemble des territoires de même échelle (communes, EPCI, etc.) au niveau national
        sont triés par valeur croissante puis répartis en trois groupes de taille égale :
      </p>
      <ul>
        <li><strong>1er tercile</strong> : le tiers des territoires ayant les valeurs les plus faibles.</li>
        <li><strong>2e tercile</strong> : le tiers intermédiaire.</li>
        <li><strong>3e tercile</strong> : le tiers des territoires ayant les valeurs les plus élevées.</li>
      </ul>
      <p>
        Les seuils sont calculés à l'échelle nationale pour la période sélectionnée, ce qui garantit
        qu'un territoire conserve la même classification quel que soit le territoire parent dans lequel
        il est observé. Par exemple, une commune classée dans le 1er tercile de consommation au niveau
        national restera dans le 1er tercile qu'elle soit vue depuis son EPCI, son département ou sa région.
      </p>
      <p>
        <strong>Sources et millésimes.</strong><br />
        L'axe consommation est issu des fichiers fonciers (Cerema), annualisé pour afficher un rythme.
        L'axe indicateur socio-économique provient du recensement INSEE (dossier complet),
        disponible aux millésimes <strong>2011</strong>, <strong>2016</strong> et <strong>2022</strong>.
        L'évolution de l'indicateur est exprimée en rythme annuel moyen (% par an),
        obtenu en divisant la variation totale par le nombre d'années entre les deux millésimes :
      </p>
      <ul>
        <li>Période se terminant avant 2016 : évolution 2011→2016, divisée par 5 ans.</li>
        <li>Période débutant après 2016 : évolution 2016→2022, divisée par 6 ans.</li>
        <li>Sinon : évolution 2011→2022, divisée par 11 ans.</li>
      </ul>
      <p>
        Les années <strong>2009</strong>, <strong>2010</strong> et <strong>2023</strong> ne disposent
        pas de données INSEE propres. Pour les périodes incluant ces années, le rythme annuel
        utilisé est celui du couple de millésimes le plus proche (par exemple,
        2009–2012 utilise le rythme annuel 2011→2016).
      </p>
    </div>
  ), []);

  const handlePointClick = useMemo(
    () => CHILD_LAND_TYPE_MAP[mapChildLandType] ? handleMapPointClick : undefined,
    [mapChildLandType, handleMapPointClick]
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
            onPointClick={handlePointClick}
            onPointHover={handlePointHover}
          >
            {chartChildren}
          </GenericChart>
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
              childLandTypeLabel={getLandTypeLabel(mapChildLandType, true).toLowerCase()}
              highlightedCell={hoveredCell}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export type { BivariateMapProps, MapDrilldown } from "./types";

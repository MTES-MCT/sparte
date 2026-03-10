import React, { useMemo, useState, useRef } from "react";
import styled from "styled-components";
import { useGetChartConfigQuery } from "@services/api";
import { theme } from "@theme";
import Loader from "@components/ui/Loader";
import Button from "@components/ui/Button";
import ChartDataSource from "@components/charts/ChartDataSource";
import ChartExplorer from "@components/charts/ChartExplorer";
import type { DataSource } from "@components/charts/GenericChart";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TreemapItem {
  name: string;
  value: number; // surface in ha (determines rectangle size)
  colorValue: number; // consumption % (determines color intensity)
}

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  item: TreemapItem;
}

// ---------------------------------------------------------------------------
// Squarified treemap layout (Bruls, Huizing & van Wijk)
// ---------------------------------------------------------------------------

function worstRatio(areas: number[], side: number): number {
  const s = areas.reduce((a, b) => a + b, 0);
  const s2 = s * s;
  const w2 = side * side;
  return Math.max((w2 * Math.max(...areas)) / s2, s2 / (w2 * Math.min(...areas)));
}

function squarify(
  items: { area: number; item: TreemapItem }[],
  container: { x: number; y: number; w: number; h: number }
): LayoutRect[] {
  if (items.length === 0 || container.w <= 0 || container.h <= 0) return [];

  if (items.length === 1) {
    return [{ x: container.x, y: container.y, w: container.w, h: container.h, item: items[0].item }];
  }

  const isWide = container.w >= container.h;
  const side = isWide ? container.h : container.w;

  // Greedily build a row minimising worst aspect ratio
  const row: (typeof items)[number][] = [items[0]];
  let best = worstRatio([items[0].area], side);

  for (let i = 1; i < items.length; i++) {
    const candidateAreas = row.map((r) => r.area).concat(items[i].area);
    const ratio = worstRatio(candidateAreas, side);
    if (ratio <= best) {
      row.push(items[i]);
      best = ratio;
    } else {
      break;
    }
  }

  const rowArea = row.reduce((s, r) => s + r.area, 0);
  const rects: LayoutRect[] = [];

  if (isWide) {
    const rowW = container.h > 0 ? rowArea / container.h : 0;
    let y = container.y;
    for (const r of row) {
      const h = rowW > 0 ? r.area / rowW : 0;
      rects.push({ x: container.x, y, w: rowW, h, item: r.item });
      y += h;
    }
    const rest = items.slice(row.length);
    if (rest.length > 0) {
      rects.push(...squarify(rest, { x: container.x + rowW, y: container.y, w: container.w - rowW, h: container.h }));
    }
  } else {
    const rowH = container.w > 0 ? rowArea / container.w : 0;
    let x = container.x;
    for (const r of row) {
      const w = rowH > 0 ? r.area / rowH : 0;
      rects.push({ x, y: container.y, w, h: rowH, item: r.item });
      x += w;
    }
    const rest = items.slice(row.length);
    if (rest.length > 0) {
      rects.push(...squarify(rest, { x: container.x, y: container.y + rowH, w: container.w, h: container.h - rowH }));
    }
  }

  return rects;
}

function computeLayout(data: TreemapItem[], width: number, height: number): LayoutRect[] {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) return [];

  const area = width * height;
  // Ensure every territory gets at least 1.5% of the total area so small ones remain visible
  const minFraction = 0.025;
  const total = filtered.reduce((s, d) => s + d.value, 0);
  const items = filtered
    .map((d) => ({ area: Math.max(minFraction * area, (d.value / total) * area), item: d }))
    .sort((a, b) => b.area - a.area);

  // Re-normalize so areas sum to actual total area
  const adjustedTotal = items.reduce((s, i) => s + i.area, 0);
  const scale = area / adjustedTotal;
  for (const item of items) item.area *= scale;

  return squarify(items, { x: 0, y: 0, w: width, h: height });
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function lerpColor(c1: string, c2: string, t: number): string {
  const clamp = Math.max(0, Math.min(1, t));
  const parse = (hex: string, off: number) => parseInt(hex.slice(off, off + 2), 16);
  const r = Math.round(parse(c1, 1) + (parse(c2, 1) - parse(c1, 1)) * clamp);
  const g = Math.round(parse(c1, 3) + (parse(c2, 3) - parse(c1, 3)) * clamp);
  const b = Math.round(parse(c1, 5) + (parse(c2, 5) - parse(c1, 5)) * clamp);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function textColorFor(bg: string): string {
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#333" : "#fff";
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const Card = styled.div`
  display: flex;
  flex-direction: column;
  background: ${theme.colors.background};
  border-radius: ${theme.radius.default};
  box-shadow: ${theme.shadow.md};
  overflow: hidden;
  width: 100%;
`;

const CardBody = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border};
`;

const LoaderBox = styled.div`
  height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Tooltip = styled.div`
  position: absolute;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.88);
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.78rem;
  line-height: 1.5;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TreemapSVGProps {
  chartId: string;
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
  comparisonLandIds?: string | null;
  sources?: DataSource[];
  children?: React.ReactNode;
}

const SVG_W = 800;
const SVG_H = 480;
const LEGEND_W = 200;
const LEGEND_H = 10;

export const TreemapSVG: React.FC<TreemapSVGProps> = ({
  chartId,
  landId,
  landType,
  startYear,
  endYear,
  comparisonLandIds,
  sources = [],
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; rect: LayoutRect } | null>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const params: Record<string, string> = {
    start_date: String(startYear),
    end_date: String(endYear),
  };
  if (comparisonLandIds != null) params.comparison_lands = comparisonLandIds;

  const { data: config, isLoading, isFetching, error } = useGetChartConfigQuery({
    id: chartId,
    land_id: landId,
    land_type: landType,
    ...params,
  });

  const parsed = useMemo(() => {
    if (!config?.highcharts_options) return null;
    const opts = config.highcharts_options;
    const series = opts.series?.[0];
    if (!series?.data?.length) return null;

    const minColor: string = opts.colorAxis?.minColor || "#FFFFFF";
    const maxColor: string = opts.colorAxis?.maxColor || "#6a6af4";
    const title: string = opts.title?.text || "";

    const items: TreemapItem[] = series.data.map((d: any) => ({
      name: d.name,
      value: d.value,
      colorValue: d.colorValue,
    }));

    const vals = items.map((i) => i.colorValue);
    return { items, minColor, maxColor, minVal: Math.min(...vals), maxVal: Math.max(...vals), title };
  }, [config]);

  const layout = useMemo(() => (parsed ? computeLayout(parsed.items, SVG_W, SVG_H) : []), [parsed]);

  // ---- Loading / error states ----

  if (isLoading || isFetching) {
    return (
      <Card>
        <LoaderBox>
          <Loader />
        </LoaderBox>
      </Card>
    );
  }

  if (error || !parsed || layout.length === 0) {
    return (
      <Card>
        <div className="fr-text--sm fr-text-mention--grey fr-py-4w">
          <i className="bi bi-exclamation-triangle fr-mr-1w" />
          Erreur lors du chargement des données
        </div>
      </Card>
    );
  }

  const { minColor, maxColor, minVal, maxVal, title } = parsed;
  const colorRange = maxVal - minVal || 1;

  const dataTable = config?.data_table ? {
    headers: config.data_table.headers,
    rows: config.data_table.rows,
    boldFirstColumn: config.data_table.boldFirstColumn,
  } : undefined;

  // ---- Events ----

  const onMove = (e: React.MouseEvent, rect: LayoutRect, idx: number) => {
    const box = wrapperRef.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ x: e.clientX - box.left + 14, y: e.clientY - box.top - 8, rect });
    setHoverIdx(idx);
  };

  const onLeave = () => {
    setTip(null);
    setHoverIdx(null);
  };

  return (
    <Card>
      <CardBody>
      {title && (
        <p className="fr-mb-2w" style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.35, textAlign: "center", color: "#333" }}>
          {title}
        </p>
      )}

      <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: "block" }}
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id="tm-svg-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={minColor} />
              <stop offset="100%" stopColor={maxColor} />
            </linearGradient>
          </defs>

          {/* Treemap cells */}
          {layout.map((rect, i) => {
            const t = (rect.item.colorValue - minVal) / colorRange;
            const fill = lerpColor(minColor, maxColor, t);
            const txtCol = textColorFor(fill);
            const isHov = hoverIdx === i;
            const minDim = Math.min(rect.w, rect.h);
            const fontSize = Math.max(9, Math.min(14, minDim / 5));
            const maxChars = Math.floor(rect.w / (fontSize * 0.58));
            const showName = rect.w > 40 && rect.h > 24;
            const showPct = rect.w > 50 && rect.h > 40;

            const label =
              rect.item.name.length > maxChars ? rect.item.name.slice(0, maxChars - 1) + "\u2026" : rect.item.name;

            return (
              <g key={i} onMouseMove={(e) => onMove(e, rect, i)} onMouseLeave={onLeave} style={{ cursor: "default" }}>
                <rect
                  x={rect.x + 3}
                  y={rect.y + 3}
                  width={Math.max(0, rect.w - 6)}
                  height={Math.max(0, rect.h - 6)}
                  rx={3}
                  fill={fill}
                  stroke={isHov ? "#222" : "#A1A1F8"}
                  strokeWidth={isHov ? 2 : 1}
                  style={{ transition: "stroke-width 0.15s, stroke 0.15s" }}
                />
                {showName && (
                  <text
                    x={rect.x + rect.w / 2}
                    y={rect.y + rect.h / 2 + (showPct ? -fontSize * 0.45 : 0)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={txtCol}
                    fontSize={fontSize}
                    fontWeight={700}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {label}
                  </text>
                )}
                {showPct && (
                  <text
                    x={rect.x + rect.w / 2}
                    y={rect.y + rect.h / 2 + fontSize * 0.75}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={txtCol}
                    fontSize={fontSize * 0.82}
                    fontWeight={600}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {rect.item.colorValue.toFixed(2)}&thinsp;%
                  </text>
                )}
              </g>
            );
          })}

        </svg>

        {/* Color legend */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0.75rem", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.72rem", color: "#666" }}>Consommation relative à la surface (%)</span>
          <div style={{ width: LEGEND_W, height: LEGEND_H, borderRadius: 3, background: `linear-gradient(to right, ${minColor}, ${maxColor})`, border: "1px solid #ccc" }} />
          <div style={{ display: "flex", justifyContent: "space-between", width: LEGEND_W, fontSize: "0.68rem", color: "#666" }}>
            <span>{minVal.toFixed(2)} %</span>
            <span>{maxVal.toFixed(2)} %</span>
          </div>
        </div>

        {/* Hover tooltip */}
        {tip && (
          <Tooltip style={{ left: tip.x, top: tip.y }}>
            <strong>{tip.rect.item.name}</strong>
            <br />
            Surface : <strong>{tip.rect.item.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} ha</strong>
            <br />
            Consommation relative : <strong>{tip.rect.item.colorValue.toFixed(2)} %</strong>
          </Tooltip>
        )}
      </div>
      </CardBody>

      {(sources.length > 0 || dataTable) && (
        <>
          <CardFooter>
            {sources.length > 0 ? (
              <ChartDataSource sources={sources} displayMode="tag" />
            ) : (
              <div />
            )}
            <Button variant="tertiary" size="sm" icon="bi bi-chevron-right" iconPosition="right" onClick={() => setIsExplorerOpen(true)} type="button">
              Détails données et calculs
            </Button>
          </CardFooter>
          <ChartExplorer
            isOpen={isExplorerOpen}
            onClose={() => setIsExplorerOpen(false)}
            chartTitle={title}
            chartOptions={config?.highcharts_options || {}}
            sources={sources}
            dataTable={dataTable}
          >
            {children}
          </ChartExplorer>
        </>
      )}
    </Card>
  );
};

import React from "react";
import GenericChart from "@components/charts/GenericChart";
import { useGetChartConfigQuery } from "@services/api";
import { Tooltip } from "react-tooltip";

const PERIODS = [
  { value: "2011_2016", label: "2011 - 2016" },
  { value: "2016_2022", label: "2016 - 2022" },
];

const CONSO_QUALIF = ["Consommation faible", "Consommation moyenne", "Consommation forte"];

interface BivariateMapSectionProps {
  chartId: string;
  landId: string;
  landType: string;
  childLandType: string;
}

export const BivariateMapSection: React.FC<BivariateMapSectionProps> = ({
  chartId,
  landId,
  landType,
  childLandType,
}) => {
  const [period, setPeriod] = React.useState("2016_2022");
  const tooltipId = `bivariate-tooltip-${chartId}`;

  const { data: config } = useGetChartConfigQuery(
    {
      id: chartId,
      land_type: landType,
      land_id: landId,
      child_land_type: childLandType,
      period,
    },
  );

  const custom = config?.highcharts_options?.custom;
  const consoT1 = custom?.conso_t1;
  const consoT2 = custom?.conso_t2;
  const indicT1 = custom?.indic_t1;
  const indicT2 = custom?.indic_t2;
  const consoMin = custom?.conso_min;
  const consoMax = custom?.conso_max;
  const indicMin = custom?.indic_min;
  const indicMax = custom?.indic_max;
  const consoLabel = custom?.conso_label || "Consommation";
  const indicName = custom?.indicator_name || "Indicateur";
  const indicUnit = custom?.indicator_unit || "";
  const indicGender = custom?.indicator_gender || "m";
  const verdicts: string[][] = custom?.verdicts || [["", "", ""], ["", "", ""], ["", "", ""]];
  const colorGrid: string[][] | null = custom?.colors || null;

  const fem = indicGender === "f";
  const adj = { faible: "faible", moyen: fem ? "moyenne" : "moyen", fort: fem ? "forte" : "fort" };

  const fmt2 = (v: number) => parseFloat(v.toFixed(2)).toString();

  const fmtIndic = (v: number) => {
    if (indicUnit === "%") return v > 0 ? `+${fmt2(v)}` : fmt2(v);
    return fmt2(v);
  };

  const cMin = consoMin == null ? "0" : fmt2(consoMin);
  const cMax = consoMax == null ? "∞" : fmt2(consoMax);
  const iMin = indicMin == null ? "−∞" : fmtIndic(indicMin);
  const iMax = indicMax == null ? "+∞" : fmtIndic(indicMax);

  const consoRanges = consoT1 != null && consoT2 != null
    ? [
        `[${cMin}, ${fmt2(consoT1)}]`,
        `]${fmt2(consoT1)}, ${fmt2(consoT2)}]`,
        `]${fmt2(consoT2)}, ${cMax}]`,
      ]
    : null;
  const indicRanges = indicT1 != null && indicT2 != null
    ? [
        `[${iMin}, ${fmtIndic(indicT1)}]`,
        `]${fmtIndic(indicT1)}, ${fmtIndic(indicT2)}]`,
        `]${fmtIndic(indicT2)}, ${iMax}]`,
      ]
    : null;
  const indicQualif = [`${indicName} ${adj.faible}`, `${indicName} ${adj.moyen}`, `${indicName} ${adj.fort}`];

  return (
    <div className="fr-mb-5w">
      <div className="bg-white fr-p-2w rounded">
        <div className="fr-mb-2w">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`fr-btn ${period === p.value ? "fr-btn--primary" : "fr-btn--tertiary"} fr-btn--sm fr-mr-1w`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className={colorGrid ? "fr-col-12 fr-col-lg-8" : "fr-col-12"}>
            <GenericChart
              key={`${chartId}-${childLandType}-${period}`}
              id={chartId}
              land_id={landId}
              land_type={landType}
              params={{ child_land_type: childLandType, period }}
              sources={["insee", "majic"]}
              showDataTable={true}
              isMap={true}
            />
          </div>
          {colorGrid && (
            <div className="fr-col-12 fr-col-lg-4" style={{ display: "flex", alignItems: "center" }}>
              <div className="fr-p-2w" style={{ background: "#f6f6f6", borderRadius: 8, width: "100%" }}>
                <p className="fr-text--sm fr-mb-2w" style={{ fontWeight: 600, margin: 0 }}>
                  Légende
                </p>
                <div>
                {/* Grid row: Y-axis + cells */}
                <div style={{ display: "flex" }}>
                  {/* Y-axis label */}
                  <div style={{ display: "flex", alignItems: "center", height: 226, marginRight: 4 }}>
                    <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "0.85rem", fontWeight: 600 }}>
                      {consoLabel} (%)
                    </div>
                  </div>
                  {/* Grid + X-axis */}
                  <div>
                    {colorGrid.map((colors, ri) => (
                      <div key={ri} style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                        {colors.map((color, ci) => (
                          <div
                            key={`${ri}-${ci}`}
                            data-tooltip-id={tooltipId}
                            data-tooltip-html={`
                              <div style="max-width:280px">
                                <div style="display:flex;align-items:center;margin-bottom:6px">
                                  <span style="display:inline-block;width:16px;height:16px;background:${color};border-radius:3px;margin-right:8px;flex-shrink:0"></span>
                                  <strong>${CONSO_QUALIF[ri]}, ${indicQualif[ci]}</strong>
                                </div>
                                <div style="margin-bottom:6px;font-size:0.85rem;line-height:1.5">
                                  <div><strong>${consoLabel} :</strong> ${consoRanges ? consoRanges[ri] + " %" : CONSO_QUALIF[ri].toLowerCase()}</div>
                                  <div><strong>${indicName} :</strong> ${indicRanges
                                    ? indicRanges[ci] + (indicUnit ? " " + indicUnit : "")
                                    : indicQualif[ci]}</div>
                                </div>
                                ${verdicts[ri]?.[ci] ? `<div style="font-size:0.85rem;font-style:italic;line-height:1.5;border-top:1px solid rgba(255,255,255,0.3);padding-top:6px">${verdicts[ri][ci]}</div>` : ""}
                              </div>
                            `}
                            style={{ width: 72, height: 72, backgroundColor: color, margin: 1, borderRadius: 4 }}
                          />
                        ))}
                        {consoRanges && (
                          <span style={{ fontSize: "0.72rem", marginLeft: 8, lineHeight: 1.2, whiteSpace: "nowrap", color: "#555" }}>
                            {consoRanges[ri]}
                          </span>
                        )}
                      </div>
                    ))}
                    <Tooltip id={tooltipId} className="fr-text--xs" opacity={1} />
                    {/* X-axis category labels */}
                    {indicRanges && (
                      <div style={{ display: "flex", marginTop: 6 }}>
                        {indicRanges.map((label, i) => (
                          <div key={i} style={{ width: 72, margin: "0 1px", textAlign: "center", fontSize: "0.68rem", color: "#555", lineHeight: 1.2 }}>
                            {label}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ width: 222, textAlign: "center", fontSize: "0.85rem", fontWeight: 600, marginTop: 4 }}>
                      {indicName}{indicUnit ? ` (${indicUnit})` : ""}
                    </div>
                  </div>
                </div>
                {/* Reading guide */}
                <div className="fr-mt-2w" style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#333" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ display: "inline-block", width: 18, height: 18, background: colorGrid[0]?.[2], borderRadius: 3, marginRight: 8, flexShrink: 0 }} />
                    <span>Faible consommation, {indicName.toLowerCase()} {adj.fort}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ display: "inline-block", width: 18, height: 18, background: colorGrid[1]?.[1], borderRadius: 3, marginRight: 8, flexShrink: 0 }} />
                    <span>Situation intermédiaire</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ display: "inline-block", width: 18, height: 18, background: colorGrid[2]?.[0], borderRadius: 3, marginRight: 8, flexShrink: 0 }} />
                    <span>Forte consommation, {indicName.toLowerCase()} {adj.faible}</span>
                  </div>
                  <p className="fr-text--xs" style={{ margin: 0, color: "#666", fontStyle: "italic" }}>
                    Survolez chaque case pour plus de détails.
                  </p>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

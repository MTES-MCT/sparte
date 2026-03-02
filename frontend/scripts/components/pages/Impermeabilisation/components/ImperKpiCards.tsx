import React from "react";
import Kpi from "@components/ui/Kpi";
import { formatNumber } from "@utils/formatUtils";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperKpiCards: React.FC = () => {
  const {
    landImperStockIndex,
    landImperFluxIndex,
    isInterdepartemental,
  } = useImpermeabilisationContext();

  const millesimeLabel = isInterdepartemental
    ? `Millésime n°${landImperStockIndex.millesime_index}`
    : landImperStockIndex.years?.[0]?.toString() ?? "–";

  const imperNettePeriodText = isInterdepartemental
    ? `Entre le millésime n°${landImperStockIndex.millesime_index - 1} et le millésime n°${landImperStockIndex.millesime_index}`
    : `Entre ${landImperStockIndex.flux_previous_years?.[0] ?? "–"} et ${landImperStockIndex.years?.[0] ?? "–"}`;

  const imperNetteFooterMetrics: [
    { icon: string; label: string; value: string; iconVariant?: "default" | "success" | "error" },
    { icon: string; label: string; value: string; iconVariant?: "default" | "success" | "error" }
  ] = [
    {
      icon: "bi bi-plus-lg",
      label: "Imperméabilisation",
      value: `${formatNumber({ number: landImperFluxIndex?.flux_imper })} ha`,
      iconVariant: "error",
    },
    {
      icon: "bi bi-dash-lg",
      label: "Désimperméabilisation",
      value: `${formatNumber({ number: landImperFluxIndex?.flux_desimper })} ha`,
      iconVariant: "success",
    },
  ];

  const surfacesImperFooterMetrics: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-percent",
      label: "Part du territoire",
      value: `${formatNumber({ number: landImperStockIndex.percent })} %`,
    },
    {
      icon: "bi bi-calendar3",
      label: "Millésime",
      value: millesimeLabel,
    },
  ];

  return (
    <div className="fr-mb-5w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-6">
          <Kpi
            icon="bi bi-droplet"
            label="Imperméabilisation nette"
            description={`${imperNettePeriodText}`}
            value={
              <>
                {formatNumber({
                  number: landImperStockIndex.flux_surface,
                  addSymbol: true,
                })}{" "}
                <span>ha</span>
              </>
            }
            variant="default"
            badge="Donnée clé"
            footer={{
              type: "metric",
              items: imperNetteFooterMetrics,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <Kpi
            icon="bi bi-droplet"
            label="Surfaces imperméables"
            value={
              <>
                {formatNumber({ number: landImperStockIndex.surface })}{" "}
                <span>ha</span>
              </>
            }
            variant="default"
            footer={{
              type: "metric",
              items: surfacesImperFooterMetrics,
            }}
          />
        </div>
      </div>
    </div>
  );
};

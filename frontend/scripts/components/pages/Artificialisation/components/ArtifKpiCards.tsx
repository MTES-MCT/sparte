import React from "react";
import Kpi from "@components/ui/Kpi";
import { formatNumber } from "@utils/formatUtils";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

export const ArtifKpiCards: React.FC = () => {
  const {
    landArtifStockIndex,
    landArtifFluxIndex,
    isInterdepartemental,
  } = useArtificialisationContext();

  const artifNettePeriodText = isInterdepartemental
    ? `Entre le millésime n°${landArtifStockIndex.millesime_index - 1} et le millésime n°${landArtifStockIndex.millesime_index}`
    : `Entre ${landArtifStockIndex.flux_previous_years?.[0] ?? "–"} et ${landArtifStockIndex.years?.[0] ?? "–"}`;

  const artifNetteFooterMetrics: [{ icon: string; label: string; value: string; iconVariant?: "default" | "success" | "error" }, { icon: string; label: string; value: string; iconVariant?: "default" | "success" | "error" }] = [
    { icon: "bi bi-plus-lg", label: "Artificialisation", value: landArtifFluxIndex != null ? `${formatNumber({ number: landArtifFluxIndex.flux_artif })} ha` : "–", iconVariant: "error" },
    { icon: "bi bi-dash-lg", label: "Désartificialisation", value: landArtifFluxIndex != null ? `${formatNumber({ number: landArtifFluxIndex.flux_desartif })} ha` : "–", iconVariant: "success" },
  ];

  const millesimeLabel = isInterdepartemental
    ? `Millésime n°${landArtifStockIndex.millesime_index}`
    : String(landArtifStockIndex.years?.[0] ?? "–");

  const surfacesArtifFooterMetrics: [{ icon: string; label: string; value: string }, { icon: string; label: string; value: string }] = [
    { icon: "bi bi-percent", label: "Part du territoire", value: `${formatNumber({ number: landArtifStockIndex.percent })} %` },
    { icon: "bi bi-calendar3", label: "Millésime", value: millesimeLabel },
  ];

  return (
    <div className="fr-mb-5w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-6">
          <Kpi
            icon="bi bi-buildings"
            label="Artificialisation nette"
            description={`${artifNettePeriodText}`}
            value={<>{formatNumber({ number: landArtifStockIndex.flux_surface, addSymbol: true })} <span>ha</span></>}
            variant="default"
            badge="Donnée clé"
            footer={{
              type: "metric",
              items: artifNetteFooterMetrics,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <Kpi
            icon="bi bi-buildings"
            label="Surfaces artificialisées"
            value={<>{formatNumber({ number: landArtifStockIndex.surface })} <span>ha</span></>}
            variant="default"
            footer={{
              type: "metric",
              items: surfacesArtifFooterMetrics,
            }}
          />
        </div>
      </div>
    </div>
  );
};

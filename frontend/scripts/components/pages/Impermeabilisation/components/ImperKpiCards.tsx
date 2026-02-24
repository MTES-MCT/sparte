import React from "react";
import Triptych from "@components/ui/Triptych";
import Kpi from "@components/ui/Kpi";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { formatNumber } from "@utils/formatUtils";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperKpiCards: React.FC = () => {
  const {
    name,
    millesimes,
    isInterdepartemental,
    landImperStockIndex,
    landImperFluxIndex,
  } = useImpermeabilisationContext();

  const millesimeLabel = isInterdepartemental
    ? `Millésime n°${landImperStockIndex.millesime_index}`
    : landImperStockIndex.years?.[0]?.toString() ?? "–";

  const imperNettePeriodText = isInterdepartemental
    ? `Entre le millésime n°${landImperStockIndex.millesime_index - 1} et le millésime n°${landImperStockIndex.millesime_index}`
    : `Entre ${landImperStockIndex.flux_previous_years?.[0] ?? "–"} et ${landImperStockIndex.years?.[0] ?? "–"}`;

  const imperNetteFooterMetrics: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-plus-lg",
      label: "Imperméabilisation",
      value: `${formatNumber({ number: landImperFluxIndex?.flux_imper })} ha`,
    },
    {
      icon: "bi bi-dash-lg",
      label: "Désimperméabilisation",
      value: `${formatNumber({ number: landImperFluxIndex?.flux_desimper })} ha`,
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
      <Triptych
        className="fr-mb-5w"
        definition={{
          content: (
            <>
              <p>L'imperméabilisation des sols est définie comme :</p>
              <ul>
                <li>
                  1° Surfaces dont les sols sont imperméabilisés en{" "}
                  <strong>raison du bâti</strong> (constructions, aménagements,
                  ouvrages ou installations).
                </li>
                <li>
                  2° Surfaces dont les sols sont imperméabilisés en{" "}
                  <strong>raison d'un revêtement</strong> (artificiel, asphalté,
                  bétonné, couvert de pavés ou de dalles).
                </li>
              </ul>
            </>
          ),
        }}
        donnees={{
          content: (
            <>
              <p>
                La mesure de l'imperméabilisation d'un territoire repose sur la
                donnée{" "}
                <strong>OCS GE (Occupation du Sol à Grande Échelle)</strong>,
                base de données de référence pour la description de l'occupation
                du sol.
              </p>
              <p>
                Cette donnée est produite par l'IGN tous les 3 ans pour chaque
                département. Chaque production est appelée un millésime.
              </p>
              <LandMillesimeTable
                millesimes={millesimes}
                territory_name={name}
                is_interdepartemental={isInterdepartemental}
                compact
              />
            </>
          ),
        }}
      />
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
            variant="error"
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

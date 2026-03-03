import React from "react";
import Kpi from "@components/ui/Kpi";
import { FricheAbstract } from "@components/features/friches";
import { formatNumber, pluralize } from "@utils/formatUtils";
import { useFrichesContext } from "../context/FrichesContext";

export const FrichesKpiCards: React.FC = () => {
  const { name, fricheStatus, fricheStatusDetails } = useFrichesContext();

  const {
    friche_sans_projet_surface,
    friche_sans_projet_surface_artif,
    friche_sans_projet_surface_imper,
    friche_avec_projet_surface,
    friche_avec_projet_surface_artif,
    friche_avec_projet_surface_imper,
    friche_reconvertie_surface,
    friche_reconvertie_surface_artif,
    friche_reconvertie_surface_imper,
    friche_sans_projet_count,
    friche_avec_projet_count,
    friche_reconvertie_count,
  } = fricheStatusDetails;

  const sansProjetFooter: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-buildings",
      label: "Surfaces artificialisées",
      value: `${formatNumber({ number: friche_sans_projet_surface_artif })} ha`,
    },
    {
      icon: "bi bi-droplet",
      label: "Surfaces imperméables",
      value: `${formatNumber({ number: friche_sans_projet_surface_imper })} ha`,
    },
  ];

  const avecProjetFooter: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-buildings",
      label: "Surfaces artificialisées",
      value: `${formatNumber({ number: friche_avec_projet_surface_artif })} ha`,
    },
    {
      icon: "bi bi-droplet",
      label: "Surfaces imperméables",
      value: `${formatNumber({ number: friche_avec_projet_surface_imper })} ha`,
    },
  ];

  const reconvertieFooter: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-buildings",
      label: "Surfaces artificialisées",
      value: `${formatNumber({ number: friche_reconvertie_surface_artif })} ha`,
    },
    {
      icon: "bi bi-droplet",
      label: "Surfaces imperméables",
      value: `${formatNumber({ number: friche_reconvertie_surface_imper })} ha`,
    },
  ];

  return (
    <div className="fr-mb-5w">
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-xl-4">
          <Kpi
            icon="bi bi-building-x"
            label={`${friche_sans_projet_count} ${pluralize(friche_sans_projet_count, "friche")} sans projet`}
            value={
              <>
                {formatNumber({ number: friche_sans_projet_surface })}{" "}
                <span>ha</span>
              </>
            }
            variant="default"
            badge="Actionnable"
            footer={{
              type: "metric",
              items: sansProjetFooter,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4">
          <Kpi
            icon="bi bi-building"
            label={`${friche_avec_projet_count} ${pluralize(friche_avec_projet_count, "friche")} avec projet`}
            value={
              <>
                {formatNumber({ number: friche_avec_projet_surface })}{" "}
                <span>ha</span>
              </>
            }
            variant="default"
            footer={{
              type: "metric",
              items: avecProjetFooter,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4">
          <Kpi
            icon="bi bi-building-check"
            label={`${friche_reconvertie_count} ${pluralize(friche_reconvertie_count, "friche")} reconvertie${friche_reconvertie_count > 1 ? "s" : ""}`}
            value={
              <>
                {formatNumber({ number: friche_reconvertie_surface })}{" "}
                <span>ha</span>
              </>
            }
            variant="default"
            footer={{
              type: "metric",
              items: reconvertieFooter,
            }}
          />
        </div>
      </div>

      <FricheAbstract
        friche_status={fricheStatus}
        friche_status_details={fricheStatusDetails}
        name={name}
      />
    </div>
  );
};

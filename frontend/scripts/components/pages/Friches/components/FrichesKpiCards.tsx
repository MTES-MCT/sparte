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

  return (
    <div className="fr-mb-5w">
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-xl-4">
          <Kpi
            icon="bi bi-building-x"
            value={
              <>
                <div>
                  {formatNumber({ number: friche_sans_projet_surface })}{" "}
                  <span>ha</span>
                </div>
                <span className="fr-badge fr-badge--no-icon text-lowercase fr-badge--warning">
                  <strong>
                    {friche_sans_projet_count}{" "}
                    {pluralize(friche_sans_projet_count, "friche")} sans projet
                  </strong>
                </span>
              </>
            }
            variant="default"
            footer={{
              type: "metric",
              items: [
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
              ],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4">
          <Kpi
            icon="bi bi-building"
            value={
              <>
                <div>
                  {formatNumber({ number: friche_avec_projet_surface })}{" "}
                  <span>ha</span>
                </div>
                <span className="fr-badge fr-badge--no-icon text-lowercase fr-badge--info">
                  <strong>
                    {friche_avec_projet_count}{" "}
                    {pluralize(friche_avec_projet_count, "friche")} avec projet
                  </strong>
                </span>
              </>
            }
            variant="default"
            footer={{
              type: "metric",
              items: [
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
              ],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4">
          <Kpi
            icon="bi bi-building-check"
            value={
              <>
                <div>
                  {formatNumber({ number: friche_reconvertie_surface })}{" "}
                  <span>ha</span>
                </div>
                <span className="fr-badge fr-badge--no-icon text-lowercase fr-badge--success">
                  <strong>
                    {friche_reconvertie_count}{" "}
                    {pluralize(friche_reconvertie_count, "friche")} reconvertie
                    {friche_reconvertie_count > 1 ? "s" : ""}
                  </strong>
                </span>
              </>
            }
            variant="default"
            footer={{
              type: "metric",
              items: [
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
              ],
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

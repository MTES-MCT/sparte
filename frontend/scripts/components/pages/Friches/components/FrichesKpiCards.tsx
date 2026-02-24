import React from "react";
import Triptych from "@components/ui/Triptych";
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
    <>
      <Triptych
        className="fr-mb-5w"
        definition={{
          content: (
            <>
              <p>
                La loi Climat et Résilience du 22 août 2021 définit ce qu'est
                une friche au sens du code de l'urbanisme : "
                <strong>
                  tout bien ou droit immobilier, bâti ou non bâti, inutilisé et
                  dont l'état, la configuration ou l'occupation totale ou
                  partielle ne permet pas un réemploi sans un aménagement ou des
                  travaux préalables
                </strong>
                ".
              </p>
              <p>
                Une friche est donc une zone désaffectée après avoir connu une
                activité économique (industrielle ou commerciale), des usages
                résidentiels ou des équipements. On estime que ces sites
                pourraient représenter en France entre 90 000 et 150 000
                hectares d'espaces inemployés.
              </p>
            </>
          ),
        }}
        donnees={{
          content: (
            <>
              <p>
                Les données utilisées proviennent du recensement des friches
                réalisé par le <strong>CEREMA</strong> dans le cadre du
                dispositif <strong>Cartofriches</strong>.
              </p>
              <p>
                On distingue deux sources de données : les friches
                pré-identifiées au niveau national par le Cerema, et les friches
                consolidées par des acteurs des territoires qui possèdent un
                observatoire ou réalisent des études.
              </p>
              <p>
                Ces contributeurs locaux à Cartofriches sont listés ici :{" "}
                <a
                  href="https://artificialisation.biodiversitetousvivants.fr/cartofriches/observatoires-locaux"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  observatoires locaux
                </a>
                .{" "}
                <a
                  href="https://cartofriches.cerema.fr/cartofriches/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contribuer à la donnée sur les friches
                </a>
              </p>
              <p>
                <strong>
                  Il est important de noter que ces données ne sont ni
                  exhaustives ni homogènes
                </strong>{" "}
                sur l'ensemble du territoire national, et dépendent notamment de
                la présence ou non d'un observatoire local.
              </p>
              <p>
                Les données relatives à l'artificialisation et
                l'imperméabilisation des friches sont issues des données OCS GE.
              </p>
            </>
          ),
        }}
      />

      <h2 className="fr-mt-5w">Vue d'ensemble</h2>

      <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
        <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
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
        <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
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
        <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
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
        className="fr-mt-2w"
      />
    </>
  );
};

import React from "react";
import { FrichesChart } from "@components/charts/friches/FrichesChart";
import BaseCard from "@components/ui/BaseCard";
import { useFrichesContext } from "../context/FrichesContext";

const FRICHES_ANALYSIS_CHARTS: Array<{ id: string; sources: string[] }> = [
  { id: "friche_pollution", sources: ["cartofriches"] },
  { id: "friche_surface", sources: ["cartofriches"] },
  { id: "friche_type", sources: ["cartofriches"] },
  { id: "friche_zonage_environnemental", sources: ["cartofriches"] },
  { id: "friche_zonage_type", sources: ["cartofriches"] },
  { id: "friche_zone_activite", sources: ["cartofriches"] },
];

const DetailsFricheZonageEnvironnemental: React.FC = () => (
  <div>
    <h6 className="fr-mb-1w">Informations complémentaires</h6>
    <p className="fr-text--xs">
      <strong>
        La zone naturelle d'intérêt écologique, faunistique et floristique (en
        abrégé ZNIEFF)
      </strong>{" "}
      est un espace naturel inventorié en raison de son caractère remarquable.
      Elle complète les zonages réglementaires (aires protégées) pour guider les
      décisions d'aménagement du territoire (documents d'urbanisme, créations
      d'espaces protégés, schémas départementaux de carrière…) et éviter
      l'artificialisation des zones à fort enjeu écologique.
    </p>
    <p className="fr-text--xs fr-mb-0">
      <strong>Le réseau Natura 2000</strong> rassemble des aires protégées
      créées par les États membres de l'Union européenne sur la base d'une liste
      d'habitats et d'espèces menacés, définies par les deux directives
      européennes Oiseaux et Habitats, Faune, Flore.
    </p>
  </div>
);

const DetailsFricheBySize: React.FC = () => (
  <div>
    <h6 className="fr-mb-1w">Calcul</h6>
    <p className="fr-text--xs">
      Les 4 catégories de taille sont déterminées à partir de l'ensemble des
      tailles des friches à l'échelle nationale, d'après les friches incluent
      dans les données <strong>Cartofriches</strong>.
    </p>
  </div>
);

const DetailsFricheByZonageType: React.FC = () => (
  <div>
    <h6 className="fr-mb-1w">Informations complémentaires</h6>
    <p className="fr-text--xs">
      N : Naturelle et Forestière, U : Urbaine, A : Agricole, AU : A Urbaniser,
      ZC : Zone Constructible, Zca : Zone Construstible d'activité, ZnC : Zone
      Non Constructible
    </p>
    <p className="fr-text--xs fr-mb-0">
      Une zone d'activité ou encore une zone d'activités économiques (ZAE) est,
      en France, un site réservé à l'implantation d'entreprises dans un
      périmètre donné.{" "}
      <a
        href="https://outil2amenagement.cerema.fr/outils/linventaire-des-zones-dactivites-economiques-izae"
        target="_blank"
        rel="noopener noreferrer"
      >
        En savoir plus
      </a>
    </p>
  </div>
);

export const FrichesCharts: React.FC = () => {
  const { landId, landType, showCharts } = useFrichesContext();

  if (!showCharts) return null;

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mt-2w">
      {FRICHES_ANALYSIS_CHARTS.map((chart) => (
        <div key={chart.id} className="fr-col-12 fr-col-md-6">
          <BaseCard>
            <FrichesChart
              id={chart.id}
              land_id={landId}
              land_type={landType}
              sources={chart.sources}
              showDataTable={true}
            >
              {chart.id === "friche_zonage_environnemental" && (
                <DetailsFricheZonageEnvironnemental />
              )}
              {chart.id === "friche_surface" && <DetailsFricheBySize />}
              {chart.id === "friche_zonage_type" && (
                <DetailsFricheByZonageType />
              )}
            </FrichesChart>
          </BaseCard>
        </div>
      ))}
    </div>
  );
};

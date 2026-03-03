import React from "react";
import { formatNumber, pluralize } from "@utils/formatUtils";
import { FricheStatusEnum, FricheStatusDetails } from "@services/types/land";

interface FricheAbstractContentProps {
  friche_status: FricheStatusEnum;
  friche_status_details: FricheStatusDetails;
  name: string;
}

export const FricheAbstractContent: React.FC<FricheAbstractContentProps> = ({
  friche_status,
  friche_status_details,
  name,
}) => {
  const potentielContent = (
    <p className="fr-text--sm fr-mb-0">
      D'après les données disponibles, il y a actuellement{" "}
      <strong>
        {friche_status_details.friche_sans_projet_count}{" "}
        {pluralize(
          friche_status_details.friche_sans_projet_count,
          "friche"
        )}{" "}
        sans projet
      </strong>{" "}
      sur le territoire de <strong>{name}</strong>, représentant un total de
      surface artificialisée de{" "}
      <strong>
        {formatNumber({
          number: friche_status_details.friche_sans_projet_surface_artif,
        })}{" "}
        ha
      </strong>
      .{" "}
      <strong>
        La réhabilitation de friches semble être un levier de sobriété foncière
        actionnable pour ce territoire.
      </strong>
    </p>
  );

  const contentMap = {
    [FricheStatusEnum.GISEMENT_NUL_ET_SANS_POTENTIEL]: (
      <p className="fr-text--sm fr-mb-0">
        D'après les données disponibles, il n'y a actuellement{" "}
        <strong>aucune friche sans projet</strong> sur le territoire de{" "}
        <strong>{name}</strong>.{" "}
        <strong>
          La réhabilitation des friches ne semble pas être un levier de
          sobriété foncière actionnable pour ce territoire.
        </strong>
      </p>
    ),
    [FricheStatusEnum.GISEMENT_NUL_CAR_POTENTIEL_EXPLOITE]: (
      <p className="fr-text--sm fr-mb-0">
        D'après les données disponibles, il n'y a actuellement{" "}
        <strong>aucune friche sans projet</strong> sur le territoire de{" "}
        <strong>{name}</strong>. L'absence de friches sans projet est due à
        l'exploitation du potentiel des friches existantes. En effet{" "}
        <strong>
          {friche_status_details.friche_reconvertie_count}{" "}
          {pluralize(
            friche_status_details.friche_reconvertie_count,
            "friche"
          )}{" "}
          ont été{" "}
          {pluralize(
            friche_status_details.friche_reconvertie_count,
            "reconvertie"
          )}
        </strong>
        , et{" "}
        <strong>
          {friche_status_details.friche_avec_projet_count}{" "}
          {pluralize(
            friche_status_details.friche_avec_projet_count,
            "friche"
          )}{" "}
          sont actuellement en projet
        </strong>
        .{" "}
        <strong>
          La réhabilitation de friches ne semble plus être un levier de
          sobriété foncière actionnable pour ce territoire.
        </strong>
      </p>
    ),
    [FricheStatusEnum.GISEMENT_POTENTIEL_ET_NON_EXPLOITE]: potentielContent,
    [FricheStatusEnum.GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION]:
      potentielContent,
  };

  return <>{contentMap[friche_status]}</>;
};

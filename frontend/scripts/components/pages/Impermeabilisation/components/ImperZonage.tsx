import React from "react";
import { ImpermeabilisationZonage } from "./ImpermeabilisationZonage";
import { ZonageUrbanismeMap } from "@components/map/ui/ZonageUrbanismeMap";
import { ZoneTypeBadge } from "@components/ui/ZoneTypeBadge";
import { LandType } from "@services/types/land";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperZonage: React.FC = () => {
  const { landData, land_type, hasZonage, imperZonageIndex } =
    useImpermeabilisationContext();

  return (
    <div className="fr-mb-5w">
      <h2 className="fr-mt-7w">Espaces imperméabilisés des zones d'urbanisme</h2>
      <p className="fr-text--sm fr-mb-2w">
        Le tableau ci-dessous et la carte associée croisent les zones
        d'urbanisme (PLU/PLUi) avec les données OCS GE pour mesurer le taux
        d'imperméabilisation de chaque zone.
      </p>
      <ImpermeabilisationZonage imperZonageIndex={imperZonageIndex} />
      <div className="fr-mt-4w" />
      <p className="fr-text--sm fr-mb-2w">
        La carte superpose les zones d'urbanisme et l'imperméabilisation du sol. Les
        zones sont colorées par type&nbsp;: <ZoneTypeBadge type="U" />{" "}
        <ZoneTypeBadge type="AU" /> <ZoneTypeBadge type="N" />{" "}
        <ZoneTypeBadge type="A" />.
        <br />
        Cliquez sur une zone pour révéler l'imperméabilisation du sol en dessous et
        survolez les objets OCS GE pour identifier leur caractéristique d'imperméabilisation.
      </p>
      {land_type !== LandType.REGION && hasZonage && (
        <ZonageUrbanismeMap landData={landData} mode="imper" />
      )}
    </div>
  );
};

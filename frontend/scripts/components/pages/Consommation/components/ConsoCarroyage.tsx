import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { CarroyageLeaMap } from "@components/map";
import { useConsommationControls } from "../context/ConsommationControlsContext";

interface ConsoCarroyageProps {
  landData: LandDetailResultType;
}

export const ConsoCarroyage: React.FC<ConsoCarroyageProps> = ({ landData }) => {
  const { startYear, endYear, childType } = useConsommationControls();

  return (
    <div className="fr-mb-7w fr-mt-5w">
      <h3 id="conso-carroyage">Carroyage de la consommation d'espaces</h3>
      <p className="fr-text--sm fr-mb-2w">
        Cette carte utilise un <strong>carroyage de 1 km x 1 km</strong> afin
        de <strong>respecter le secret statistique</strong> tout en permettant de localiser la consommation d'espaces NAF.
        Cette représentation ne reflète pas la forme exacte des parcelles consommées et un même carreau peut chevaucher plusieurs communes.
        Les valeurs affichées sont donc des approximations liées à ce maillage, mais permettent toutefois d'identifier les secteurs les plus consommateurs du territoire.
      </p>
      <div className="fr-alert fr-alert--warning fr-alert--sm fr-mb-2w">
        <p className="fr-text--sm fr-mb-0">
          Seules les données ayant pu être géolocalisées sont présentes dans les données carroyées.
          Le total affiché ici peut donc être <strong>différent de celui du territoire</strong>.
        </p>
      </div>

      <CarroyageLeaMap landData={landData} startYear={startYear} endYear={endYear} childLandType={childType} />
    </div>
  );
};

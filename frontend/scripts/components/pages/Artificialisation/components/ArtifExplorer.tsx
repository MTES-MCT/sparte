import React from "react";
import styled from "styled-components";
import { LandType } from "@services/types/land";
import { OcsgeObjectMap } from "@components/map/ui/OcsgeObjectMap";
import { useArtificialisationContext } from "../context/ArtificialisationContext";
import Notice from "@components/ui/Notice";

const ColorSquare = styled.span<{ $color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  background: ${({ $color }) => $color};
  margin-right: 3px;
  vertical-align: middle;
`;

export const ArtifExplorer: React.FC = () => {
  const { landData, landType } = useArtificialisationContext();

  if (landType === LandType.REGION) {
    return null;
  }

  return (
    <div className="fr-mb-5w">
      <h2>Explorateur des objets OCS GE artificialisés</h2>
      <p className="fr-text--sm fr-mb-2w">
        Cette carte permet d'explorer individuellement les objets OCS GE artificialisés du territoire. Chaque objet est caractérisé par un croisement couverture / usage qui détermine s'il est artificialisé ou non.
        Sélectionnez un objet sur la carte pour consulter sa couverture, son usage et son statut d'artificialisation.
        <br />
        <br />Exemple : un objet de couverture <ColorSquare $color="rgb(255, 55, 122)" /> <strong>Zones bâties</strong> et d'usage <ColorSquare $color="rgb(230, 0, 77)" /> <strong>Résidentiel</strong> est considéré comme <strong style={{ color: "#E63946" }}>artificialisé</strong>.
        À l'inverse, un objet de couverture <ColorSquare $color="rgb(0, 128, 64)" /> <strong>Formations herbacées</strong> et d'usage <ColorSquare $color="rgb(0, 128, 0)" /> <strong>Sylviculture</strong> est considéré comme <strong style={{ color: "#2A9D8F" }}>non artificialisé</strong>.
        <br />
        <br />Attention : certains objets dont le croisement couverture / usage correspond à de l'artificialisation peuvent ne pas être comptabilisés comme tels après application des <a href="#seuils-interpretation">seuils d'interprétation</a>.
      </p>
      <OcsgeObjectMap landData={landData} mode="artif" />
    </div>
  );
};

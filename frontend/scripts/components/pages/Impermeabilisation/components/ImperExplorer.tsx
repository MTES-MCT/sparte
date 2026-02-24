import React from "react";
import { OcsgeObjectMap } from "@components/map/ui/OcsgeObjectMap";
import { LandType } from "@services/types/land";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperExplorer: React.FC = () => {
  const { landData, land_type } = useImpermeabilisationContext();

  if (land_type === LandType.REGION) return null;

  return (
    <div className="fr-mb-7w">
      <h2>Explorateur des objets OCS GE imperméabilisés</h2>
      <p className="fr-text--sm fr-mb-2w">
        Cette carte permet d'explorer individuellement les objets OCS GE
        imperméabilisés du territoire. Chaque objet est caractérisé par un
        croisement couverture / usage qui détermine s'il est imperméabilisé ou
        non. Sélectionnez un objet sur la carte pour consulter sa couverture,
        son usage et son statut d'imperméabilisation.
        <br />
        <br />
        Exemple : un objet de couverture{" "}
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            background: "rgb(255, 55, 122)",
            marginRight: 3,
            verticalAlign: "middle",
          }}
        />{" "}
        <strong>Zones bâties</strong> est considéré comme{" "}
        <strong style={{ color: "#E63946" }}>imperméabilisé</strong>. À
        l'inverse, un objet de couverture{" "}
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            background: "rgb(0, 128, 64)",
            marginRight: 3,
            verticalAlign: "middle",
          }}
        />{" "}
        <strong>Formations herbacées</strong> est considéré comme{" "}
        <strong style={{ color: "#2A9D8F" }}>non imperméabilisé</strong>.
      </p>
      <OcsgeObjectMap landData={landData} mode="imper" />
    </div>
  );
};

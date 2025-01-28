import React from "react";
import { Couverture, Usage } from "./constants/cs_and_us";
import { couvertureLabels, usageLabels } from "./constants/labels";

type PopupProps = {
  couverture: Couverture;
  usage: Usage;
  surface: number;
  isArtificial: boolean;
  isImpermeable: boolean;
};

export const Popup = ({
  couverture,
  usage,
  surface,
  isArtificial,
  isImpermeable,
}: PopupProps) => {
  return (
    <div>
      Couverture :{" "}
      <strong>
        {couvertureLabels[couverture]} ({couverture})
      </strong>
      <br />
      Usage :{" "}
      <strong>
        {usageLabels[usage]} ({usage})
      </strong>
      <br />
      Surface : <strong>{Math.round(surface)}m²</strong>
      <br />
      Est artificiel : <strong>{isArtificial ? "Oui" : "Non"}</strong>
      <br />
      Est imperméable : <strong>{isImpermeable ? "Oui" : "Non"}</strong>
    </div>
  );
};

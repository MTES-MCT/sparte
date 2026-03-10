import React, { useState } from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { CarroyageLeaMap } from "@components/map";
import Button from "@components/ui/Button";
import { useGetCarroyageDestinationConfigQuery } from "@services/api";
import { useConsommationControls } from "../context/ConsommationControlsContext";

const ColorDot = styled.span<{ $color: string; $active: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  margin-right: 6px;
  vertical-align: middle;
  border: 1px solid ${({ $active }) => ($active ? "white" : "#ccc")};
`;

const ButtonSeparator = styled.span`
  display: inline-block;
  width: 1px;
  height: 24px;
  background-color: #ccc;
  vertical-align: middle;
`;

interface ConsoCarroyageProps {
  landData: LandDetailResultType;
}

export const ConsoCarroyage: React.FC<ConsoCarroyageProps> = ({ landData }) => {
  const { startYear, endYear, childType } = useConsommationControls();
  const { data: destinationConfig } = useGetCarroyageDestinationConfigQuery(undefined);
  const [selectedDestination, setSelectedDestination] = useState("total");

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

      {destinationConfig && (
        <div className="fr-mb-2w d-flex gap-2" style={{ flexWrap: "wrap", background: "white", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", width: "fit-content" }}>
          {Object.keys(destinationConfig).map((dest, index) => (
            <React.Fragment key={dest}>
              {index === 1 && <ButtonSeparator />}
              <Button
                variant={selectedDestination === dest ? "primary" : "tertiary"}
                size="sm"
                onClick={() => setSelectedDestination(dest)}
              >
                <ColorDot $color={destinationConfig[dest].color} $active={selectedDestination === dest} />
                {destinationConfig[dest].label}
              </Button>
            </React.Fragment>
          ))}
        </div>
      )}

      <CarroyageLeaMap landData={landData} startYear={startYear} endYear={endYear} selectedDestination={selectedDestination} childLandType={childType} />
    </div>
  );
};

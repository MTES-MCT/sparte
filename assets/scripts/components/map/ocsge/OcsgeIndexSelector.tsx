import { Millesime, MillesimeByIndex } from "@services/types/land";
import React from "react";
import styled from "styled-components";

interface OcsgeYearSelectorProps {
  setIndex: (index: number) => void;
  index: number;
  availableMillesimes: Millesime[];
  availableMillesimesByIndex: MillesimeByIndex[];
}

const OcsgeYearSelectorSelect = styled.select`
  padding: 5px 10px;
  font-size: 1em;
`;

export const OcsgeIndexSelector = ({
  setIndex,
  index,
  availableMillesimes,
  availableMillesimesByIndex
}: OcsgeYearSelectorProps) => {
  return (
    <OcsgeYearSelectorSelect
      className="fr-select"
      name="selection"
      onChange={(e: any) => setIndex(e.target.value)}
      value={index}
    > 
      {availableMillesimes.length === availableMillesimesByIndex.length ? availableMillesimes.map((millesime) => {
        return (
          <option key={millesime.index} className="fr-btn fr-mr-1v" value={millesime.index}>
            {millesime.year}
          </option>
        );
      }) : availableMillesimesByIndex.map((millesime) => {
        return (
          <option key={millesime.index} className="fr-btn fr-mr-1v" value={millesime.index}>
            Millesime #{millesime.index} - ({millesime.years})
          </option>
        );
      })}
    </OcsgeYearSelectorSelect>
  );
};

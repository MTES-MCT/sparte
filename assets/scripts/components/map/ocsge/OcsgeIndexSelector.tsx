import { MillesimeByIndex } from "@services/types/land";
import React from "react";
import styled from "styled-components";

interface OcsgeYearSelectorProps {
  setIndex: (index: number) => void;
  index: number;
  availableMillesimes: MillesimeByIndex[];
}

const OcsgeYearSelectorSelect = styled.select`
  padding: 5px 10px;
  font-size: 1em;
`;

export const OcsgeIndexSelector = ({
  setIndex,
  index,
  availableMillesimes,
}: OcsgeYearSelectorProps) => {
  return (
    <OcsgeYearSelectorSelect
      className="fr-select"
      name="selection"
      onChange={(e: any) => setIndex(e.target.value)}
      value={index}
    >
      {availableMillesimes.map((millesime) => {
        return (
          <option key={millesime.index} className="fr-btn fr-mr-1v" value={millesime.index}>
            {millesime.years}
          </option>
        );
      })}
    </OcsgeYearSelectorSelect>
  );
};

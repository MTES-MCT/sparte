import React from "react";
import styled from "styled-components";

interface OcsgeYearSelectorProps {
  setYear: (year: number) => void;
  year: number;
  availableMillesimes: number[];
}

const OcsgeYearSelectorSelect = styled.select`
  padding: 5px 10px;
  font-size: 1em;
`;

export const OcsgeYearSelector = ({
  setYear,
  year,
  availableMillesimes,
}: OcsgeYearSelectorProps) => {
  return (
    <OcsgeYearSelectorSelect
      className="fr-select"
      name="selection"
      onChange={(e: any) => setYear(e.target.value)}
      value={year}
    >
      {availableMillesimes.map((millesime) => {
        return (
          <option key={millesime} className="fr-btn fr-mr-1v" value={millesime}>
            {millesime}
          </option>
        );
      })}
    </OcsgeYearSelectorSelect>
  );
};

import React from "react";
import styled from 'styled-components'

import { Selection, getSelectionByName, newSelections } from "./constants/selections";

const OcsgeMatrixSelectorSelect = styled.select`
padding: 5px 10px;
font-size: 1em;
`

interface OcsgeMatrixSelectorProps {
  setSelection: (selection: Selection) => void;
  selection: Selection;
}

export const OcsgeMatrixSelector = ({
  setSelection,
  selection,
}: OcsgeMatrixSelectorProps) => {
  return (
    <OcsgeMatrixSelectorSelect
      className="fr-select"
      name="selection"
      value={selection.name}
      onChange={(e:any) => setSelection(getSelectionByName(e.target.value))}
    >
      {newSelections
        .filter((possibleSelection) => !possibleSelection.croisement)
        .map((possibleSelection) => (
          <option
            className="fr-btn fr-mr-1v"
            value={possibleSelection.name}
            key={possibleSelection.name}
          >
            {possibleSelection.name}
          </option>
        ))}
    </OcsgeMatrixSelectorSelect>
  );
};

import React from "react";
import { couvertureLabels, usageLabels } from "./constants/labels";
import {
  MatrixSelection,
  Selection,
  UserFilter,
  checkIfMatrixSelectionIsInUserFilters,
} from "./constants/selections";
import styled from "styled-components";
import { RGBColor } from "./constants/colors";

type OcsgeMapLegendProps = {
  matrix: MatrixSelection[];
  userFilters: UserFilter[];
  setUserFilters: (filters: UserFilter[]) => void;
  selection: Selection;
};

const LegendList = styled.div`
  overflow-y: auto;
  border-radius: 5px;
  padding-right: 45px;
  max-height: 35vh;
`;

const LegendListElement = styled.div`
  display: flex;
  align-items: center;
  font-size: 1em;
`;
const LegendListElementColor = styled.div<{ color: RGBColor }>`
  width: 1em;
  height: 1em;
  margin-right: 5px;
  margin-left: 5px;
  background-color: ${(props) =>
    `rgb(${props.color[0]}, ${props.color[1]}, ${props.color[2]})`};
`;

const LegendCheckbox = styled.input`
  margin-right: 5px;
  width: 1em;
  height: 1em;
`;

const LegendCheckboxLabel = styled.label<{ $big?: boolean }>`
  font-size: ${({ $big }) => ($big ? "1.2em" : "1em")};
`;

const HorizontalLine = styled.div`
  border-top: 0.5px solid black;
  margin-bottom: 5px;
`;

export const OcsgeMapLegend = ({
  matrix,
  userFilters,
  setUserFilters,
  selection,
}: OcsgeMapLegendProps) => {
  const userFiltersAreUntouched = userFilters.length === matrix.length;
  const userFiltersAreEmpty = userFilters.length;

  const onClearFilters = () => {
    if (userFiltersAreUntouched) {
      setUserFilters([]);
    } else {
      setUserFilters(
        matrix.map(({ couverture, usage }) => ({
          couverture,
          usage,
        }))
      );
    }
  };

  let tooltip = "";
  let clearIconChecked = false;

  if (userFiltersAreUntouched) {
    tooltip = "Tout déselectionner";
    clearIconChecked = true;
  } else if (userFiltersAreEmpty) {
    tooltip = "Tout sélectionner";
  } else {
    tooltip = "Tout déselectionner";
  }

  return (
    <LegendList>
      <LegendCheckbox
        title={tooltip}
        type="checkbox"
        checked={clearIconChecked}
        onChange={onClearFilters}
      />
      <LegendCheckboxLabel $big>{selection.name}</LegendCheckboxLabel>
      <HorizontalLine />

      {matrix.map((matrixSelection) => {
        const { couverture, usage, color } = matrixSelection;

        const onChange = (e: any) => {
          const { checked } = e.target;
          if (checked) {
            setUserFilters([...userFilters, { couverture, usage }]);
          } else {
            setUserFilters(
              userFilters.filter(
                ({ couverture: userCouverture, usage: userUsage }) => {
                  if (couverture && usage) {
                    return couverture !== userCouverture || usage !== userUsage;
                  } else if (couverture) {
                    return couverture !== userCouverture;
                  } else if (usage) {
                    return usage !== userUsage;
                  }
                  return false;
                }
              )
            );
          }
        };

        let legendLabel = "";
        if (couverture) {
          legendLabel += `${couvertureLabels[couverture]} (${couverture})`;
        }
        if (couverture && usage) {
          legendLabel += " - ";
        }
        if (usage) {
          legendLabel += `${usageLabels[usage]} (${usage})`;
        }

        return (
          <LegendListElement key={`${couverture}-${usage}`}>
            <LegendCheckbox
              onChange={onChange}
              type="checkbox"
              checked={checkIfMatrixSelectionIsInUserFilters(
                matrixSelection,
                userFilters
              )}
            />
            <LegendListElementColor color={color} />
            <LegendCheckboxLabel>{legendLabel}</LegendCheckboxLabel>
          </LegendListElement>
        );
      })}
    </LegendList>
  );
};

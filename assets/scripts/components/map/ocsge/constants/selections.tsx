import React from "react";
import { Couverture, Usage, couvertures, usages } from "./cs_and_us";
import {
  RGBColor,
  getCouvertureColor,
  getUsageColor,
  getCombinedColor,
} from "./colors";

export type UserFilter = {
  couverture?: Couverture | null;
  usage?: Usage | null;
};

export type MatrixSelection = {
  couverture?: Couverture | null;
  usage?: Usage | null;
  color: RGBColor;
};

export enum SelectionName {
  COUVERTURES = "Couvertures du sol",
  USAGES = "Usages du sol",
  ZONES_PERMEABLES = "Zones perméables",
  SOLS_ARTIFICIALISES = "Sols artficialisés",
  CROISEMENT_USAGE_ET_COUVERTURE = "Croisement usage et couverture",
}

export class Selection {
  name: SelectionName;
  matrix: MatrixSelection[];
  croisement: boolean;
  Description: React.FC;

  constructor({
    name,
    matrix,
    croisement,
    Description,
  }: {
    name: SelectionName;
    matrix: MatrixSelection[];
    croisement: boolean;
    Description: React.FC;
  }) {
    this.name = name;
    this.matrix = matrix;
    this.croisement = croisement;
    this.Description = Description;
  }
}

export const newSelections = [
  new Selection({
    name: SelectionName.COUVERTURES,
    matrix: couvertures.map(
      (couverture): MatrixSelection => ({
        usage: null,
        color: getCouvertureColor(couverture),
        couverture,
      })
    ),
    croisement: false,
    Description: () => (
      <p>
        La représentation par <strong>couvertures</strong> permet de visualiser
        les 14 postes de couverture du sol définit par l'OCS GE.{" "}
        <a
          target="_blank"
          href="https://storymaps.arcgis.com/stories/193550c4e4af4f92845201d74ca8a002"
        >
          En apprendre plus sur les couvertures du sol au sens de l'OCS GE.
        </a>
      </p>
    ),
  }),
  new Selection({
    name: SelectionName.USAGES,
    matrix: usages.map(
      (usage): MatrixSelection => ({
        couverture: null,
        color: getUsageColor(usage),
        usage,
      })
    ),
    croisement: false,
    Description: () => (
      <p>
        La représentation par <strong>usages</strong> permet de visualiser les 17
        postes d'usage du sol définit par l'OCS GE.{" "}
        <a
          target="_blank"
          href="https://storymaps.arcgis.com/stories/193550c4e4af4f92845201d74ca8a002"
        >
          En apprendre plus sur les usages du sol au sens de l'OCS GE.
        </a>
      </p>
    ),
  }),
  new Selection({
    name: SelectionName.SOLS_ARTIFICIALISES,
    matrix: couvertures
      .flatMap((couverture) =>
        usages.map((usage) => ({
          couverture,
          usage,
          color: getCombinedColor(couverture, usage),
        }))
      )
      .filter(({ couverture, usage }) => {
        if (
          [
            "CS1.2.1",
            "CS1.2.2",
            "CS1.2.3",
            "CS2.1.1.1",
            "CS2.1.1.2",
            "CS2.1.1.3",
            "CS2.1.2",
            "CS2.1.3",
          ].includes(couverture)
        ) {
          return false;
        }

        if (couverture === "CS1.1.2.1" && usage === "US1.3") {
          return false;
        }

        if (
          ["CS2.2.1", "CS2.2.2"].includes(couverture) &&
          [
            "US2",
            "US3",
            "US5",
            "US235",
            "US4.1.1",
            "US4.1.2",
            "US4.1.3",
            "US4.1.4",
            "US4.1.5",
            "US4.2",
            "US4.3",
            "US6.1",
            "US6.2",
          ].includes(usage)
        ) {
          return false;
        }
        return true;
      }),
    croisement: true,
    Description: () => (
      <div>
        <p>Artif</p>
      </div>
    ),
  }),
  new Selection({
    name: SelectionName.CROISEMENT_USAGE_ET_COUVERTURE,
    matrix: couvertures.flatMap((couverture) =>
      usages.map((usage) => ({
        couverture,
        usage,
        color: getCombinedColor(couverture, usage),
      }))
    ),
    croisement: true,
    Description: () => (
      <div>
        <p>
          247 combinaisons possibles entre les couvertures et les usages du sol
        </p>
      </div>
    ),
  }),
];

export const getSelectionByName = (name: SelectionName): Selection => {
  return newSelections.find((selection) => selection.name === name);
};

export const DEFAULT_SELECTION = getSelectionByName(SelectionName.COUVERTURES);

export const checkIfMatrixSelectionIsInUserFilters = (
  matrixSelection: MatrixSelection,
  userFilters: UserFilter[]
): boolean => {
  return userFilters.some(({ couverture, usage }) => {
    if (couverture && usage) {
      return (
        couverture === matrixSelection.couverture &&
        usage === matrixSelection.usage
      );
    } else if (couverture) {
      return couverture === matrixSelection.couverture;
    } else if (usage) {
      return usage === matrixSelection.usage;
    }
    return false;
  });
};

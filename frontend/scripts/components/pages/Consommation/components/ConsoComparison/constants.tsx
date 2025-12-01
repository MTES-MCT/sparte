import React from "react";

export const CHART_DESCRIPTIONS = {
  comparisonMap: {
    title: "À propos",
    content: "Cette carte affiche votre territoire (surligné en bleu) et les territoires de comparaison. La couleur indique la consommation d'espaces NAF relative à la surface du territoire, et la taille des bulles représente la consommation d'espaces NAF totale.",
  },
  comparisonChart: {
    title: "À propos",
    content: (
      <>
        <p className="fr-text--xs fr-mb-0">
          Ce graphique compare la consommation d'espaces NAF de votre territoire avec celle de
          d'autres territoires, sélectionnés en fonction de leur proximité géographique.
        </p>
        <p className="fr-text--xs fr-mb-0">
          Cliquez sur un territoire pour voir le détail année par année de sa consommation d'espaces NAF.
        </p>
      </>
    ),
  },
  surfaceProportional: {
    title: "À propos",
    content: (
      <>
        <p className="fr-text--xs fr-mb-0">
          Ce graphique compare la consommation d'espaces NAF proportionnelle à la surface totale du territoire. Les territoires sont représentés sous forme de treemap où la taille reflète la surface du territoire.
        </p>
      </>
    ),
  },
  populationConso: {
    title: "À propos",
    content: (
      <>
        <p className="fr-text--xs fr-mb-0">
          Ce graphique compare la consommation d'espaces NAF au regard de l'évolution démographique. La taille des bulles représente la population totale de chaque territoire. La ligne médiane indique le ratio médian entre évolution démographique et consommation d'espaces NAF.
        </p>
      </>
    ),
  },
} as const;

export const GUIDE_TEXTS = {
  treemap: {
    title: "Comprendre les données",
    content: (
      <>
        <p className="fr-text--xs fr-mb-0">
          Ce graphique représente chaque territoire par un rectangle, dont la taille est proportionnelle à sa surface.
          Plus le rectangle est grand, plus le territoire est vaste. La couleur des rectangles reflète le rapport entre
          la surface d'espaces NAF consommée et la surface totale du territoire. Plus la couleur est foncée, plus la
          consommation d'espaces NAF est intense.
        </p>
        <p className="fr-text--xs fr-mb-0">
          Par exemple, un rectangle de petite taille et de couleur intense correspond à un territoire peu étendu ayant
          consommé une part significative de ses espaces NAF.
        </p>
      </>
    ),
  },
  populationBubble: {
    title: "Comprendre les données",
    content: (
      <>
        <p className="fr-text--xs fr-mb-0">
          Ce graphique représente chaque territoire par une bulle, dont la taille est proportionnelle à sa population.
          La position des bulles sur l'axe vertical indique la consommation d'espaces NAF et l'axe horizontal indique
          l'évolution démographique.
        </p>
        <p className="fr-text--xs fr-mb-0">
          Par exemple, une petite bulle située en haut à gauche correspond à un territoire peu peuplé ayant consommé
          beaucoup d'espaces NAF malgré une faible croissance démographique.
        </p>
      </>
    ),
  },
} as const;

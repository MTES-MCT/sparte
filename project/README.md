# Project app

## Objectif

Cette application a pour objectif d'accompagner un utilisateur dans l'évaluation de l'artificialisation de son territoire.

## Principales user stories

- [x] Je peux charger l'emprise de mon territoire
- [ ] Je peux visualiser mon emprise ainsi que les principaux indicateurs d'artificialisation
- [ ] J'ai accès à un tableau de suivi de l'évolution de l'artificialisation des communes qui intersectent avec mon emprise

## Modèles

* Project: table qui liste les projets d'un utilisateurs.
* Emprise: l'emprise d'un projet (foreignkey vers project)

## API Spatiale utile

https://docs.djangoproject.com/fr/3.2/ref/contrib/gis/geoquerysets

### Extent

Intéressant pour optimiser l'affichage d'un projet et ne renvoyer que les données contenu dans le rectangle.
Egalement utile pour définir l'affichage initiale de la carte pour être pile sur le projet.

[class Extent(geo_field)](https://docs.djangoproject.com/fr/3.2/ref/contrib/gis/geoquerysets/#extent)

Disponibilité : PostGIS, Oracle, SpatiaLite

Renvoie l’étendue de tous les champs geo_field du QuerySet sous forme de tuple à 4 éléments formé des coordonnées inférieure gauche et supérieure droite.

Exemple :

```
>>> qs = City.objects.filter(name__in=('Houston', 'Dallas')).aggregate(Extent('poly'))
>>> print(qs['poly__extent'])
(-96.8016128540039, 29.7633724212646, -95.3631439208984, 32.782058715820)
```

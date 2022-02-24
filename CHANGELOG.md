# Changelog

Ce changelog suit la méthode "keep a changelog" disponible ici: [https://keepachangelog.com/en/1.0.0/](https://keepachangelog.com/en/1.0.0/)

## [1.1.2] - 07.03.2022

### Corrigé
- Autoriser les tableaux de bords à afficher un diagnostic commençant en 2009
- Lors de la création d'un diagnostic, ajouter une exception à intercepter quand le territoire n'a pas été bien renseigné
## [1.2.0] - Non livrée

Backlog de la version: [https://app.clickup.com/14136489/v/li/122274320/74368258?pr=20181273](https://app.clickup.com/14136489/v/li/122274320/74368258?pr=20181273)

### Ajouté
### Modifié
* Montée de version Django vers 3.2.12
* Remplacement de app_parameter par django-app-parameter
### Corrigé

<<<<<<< HEAD
## [1.1.1] - 28.02.2022

Objectif : hotfixes pour corriger les anomalies détectées dans Sentry.

### Corrigé
* Bug lorsqu'un utilisateur demande son bilan (https://app.clickup.com/t/221e9gt)
* Bug "IndexError" lors de l'affichage d'un rapport couverture ou usage (https://app.clickup.com/t/2579cnj)
* Bug lors de la création d'un diagnostic sans territoire (https://app.clickup.com/t/221fc7v)
=======
>>>>>>> update changelog with release date

## [1.1.0] - 2022-02-23

Objectif principale : rapport sur l'artificialisation

### Ajouté
- Demander son bilan et le recevoir par e-mail
- Log des erreurs dans Sentry (voir [le tableau de bord dédié](https://sentry.io/betagouv-f7/sparte))

### Modifié
- Changement des graphiques dans les rapports Couvertures et Usages

### Corrigé


## [1.0.0] - 2022-01-25

### Ajouté
- Log des requêtes entrantes pour s'assurer qu'elles sont en cours de traitement
- US 1.1 - Fonction "Plan" :
  * Ecrans d'administration pour les plans (inc. les emprises)
  * Publication de la route API pour obtenir les emprises d'un plan
  * Ecrans de manipulation des plans (CRUD) et traitement différé de l'import du fichier shape
  * Afficher la liste des plans dans la page de détail d'un projet
- US 5.3 - Ajouter les cartes de couverture des sols 2015 et 2018
- US 11.2 - ajouter une matrice de passage entre US x CS => consommation, est artificielle...
- US 2.1 - Afficher une page "profil" pour mettre à jour ses informations personnelles
- US 2.2 - Pouvoir se désinscrire
- Tests unitaires:
  * Projet
  * Utilisateur
  * Communes artificielles
- US 8.13 - ajout de FAQ administrable dans la partie documentation (https://app.clickup.com/t/1uwt65e)

### Modifié
- US 7.8 - Carte interactive: forte atténuation des bordures des polygons
- Bascule de la logique de chargement des geolayers vers javascript, suppression des templatetags
- US7.2 - Afin de faciliter la navigation mettre le projet "ouvert" dans la barre latéralle
  * Modification du thème
  * Ajout du projet ouvert dans la top barre
  * Affichage de la page d'accueil même en mode connecté
  * Possibilité de masquer le menu latéralle
- US 7.9 - Afficher les layers dans un ordre déterminé pour faciliter la lecture
- US 10.1 - restructurer les données OCSGE pour inclure les millésimes 2013, 2016 et 2019
- Augmenter la période d'un projet pour aller jusqu'en 2020 (https://app.clickup.com/t/1uhcpk3)
- US 8.11 - refondre la page d'accueil (https://app.clickup.com/t/1p89n5g)

### Corrigé
- Affectation de la date & heure lors de l'import d'une emprise
- Masquer des layers lors de l'ouverture de la carte interactive

## [0.1.0] - 2021-06-20

Initialisation de ce changelog.

### Ajouté
- US 5.7 - charger les données issues de l'OCSGE
- US 7.4 - Dans la carte interactive, ajouter dans les propriétés la traduction du code couverture et usage
- US. 3.4 - Refaire le graphe avec les données complètes (OCSGE)
- US 3.2 - Sur le même modèle que l'artificialisation - couverture (treemap) ajouter l'usage
- US 3.6 - Dans l'onglet consommation > n'afficher que les années qui sont incluses dans la période d'analyse

### Modifié
- US 7.5 - Simplifier l'affichage en modifiant le layer "emprise du projet" pour ne laisser qu'une frontière sans couleur de fond
- US 2.3 - Utiliser des libellés français dans la page d'inscription
- US 3.6.1 - Dans l'onglet consommation > enlever tableau taux, ajouter colonne progression...
- US 3.3 - Sur le graphe consommation > changer la légende "utilisé" par "consommé"
- US 8.8 - Home projet > franciser

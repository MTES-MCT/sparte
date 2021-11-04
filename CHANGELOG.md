# Changelog

Ce changelog suit la méthode "keep a changelog" disponible ici: [https://keepachangelog.com/en/1.0.0/](https://keepachangelog.com/en/1.0.0/)


## [Unreleased]

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

### Corrigé
- Affectation de la date & heure lors de l'import d'une emprise
- Masquer des layers lors de l'ouverture de la carte interactive

## [0.1.0] - 2017-06-20

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

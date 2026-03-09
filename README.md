<img src="https://mondiagartif.beta.gouv.fr/static/img/logo-mon-diagnostic-artificialisation.svg" />
<p align="center">
  <a href="https://github.com/MTES-MCT/sparte/stargazers/">
    <img src="https://img.shields.io/github/stars/MTES-MCT/sparte" alt="">
  </a>
  <a href='http://makeapullrequest.com'><img alt='PRs Welcome' src='https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields'/></a>
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/MTES-MCT/sparte"/>
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/MTES-MCT/sparte"/>
  <a href="https://github.com/suitenumerique/meet/blob/main/LICENSE">
    <img alt="GitHub closed issues" src="https://img.shields.io/github/license/suitenumerique/meet"/>
  </a>    
</p>

<p align="center">
 <a href="https://github.com/MTES-MCT/sparte/releases">Historique des mises à jour</a> - <a href="https://github.com/MTES-MCT/sparte/issues/new">Reporter un bug</a> 
</p>
<br/>
<p>
Mon Diagnostic Artificialisation aide les collectivités à analyser et maitriser la consommation d'espaces et l'artificialisation des sols de leur territoire, en mettant en perspective des indicateurs chiffrés au regard des exigences de la loi climat et résilience, et notamment de la ZAN.
</p
<br/>

![image](https://github.com/user-attachments/assets/05ca50f8-8d68-4226-8fa4-a0ead591452e)

----

# Documentation d'installation

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Make](https://www.gnu.org/software/make/)

## Installation rapide

```bash
git clone git@github.com:MTES-MCT/sparte.git
cd sparte
make install
```

Cette commande :
- Installe Docker si nécessaire
- Crée les fichiers `.env` depuis les `.env.example`
- Build les images Docker
- Démarre tous les services (PostgreSQL, Redis, S3 local, Django, frontend, export-server)
- Applique les migrations Django
- Charge les paramètres par défaut
- Installe Astro CLI et démarre Airflow

Les services sont accessibles sur :
- Application : [http://localhost:8080/](http://localhost:8080/)
- Airflow : [http://localhost:9090/](http://localhost:9090/)

## Commandes utiles

Lancer `make help` pour voir toutes les commandes disponibles.

```bash
make start              # Démarre tous les services
make stop               # Arrête tous les services
make migrate            # Applique les migrations Django
make shell              # Ouvre un shell Django
make test               # Lance les tests Python et JS
make logs               # Affiche les logs de tous les services
```

## Configuration

Le fichier `.env` contient les variables d'environnement locales. Il est créé automatiquement depuis `.env.example` lors de l'installation.

- Compléter les valeurs commençant par `YOUR`
- Demander à un mainteneur les valeurs marquées `ASK_A_MAINTAINER`

Voir [CONFIG.md](CONFIG.md) pour le détail de tous les fichiers de configuration et [ENV.md](ENV.md) pour les variables d'environnement.

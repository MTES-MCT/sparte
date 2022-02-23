# HOW TO MEP

Ce document a pour objectif de lister l'ensemble des étapes à respecter pour réussir la prochaine MEP.

Prochaine MEP : v1.1.0, release février, voir le [changelog](CHANGELOG.md) et [clickup](https://app.clickup.com/14136489/v/s/20181273)

## TODO v1.1.0

1. Pusher la branche
2. Jouer le script de mise à jour :
```
cd ~/sparte/scripts
python cmd.py --env prod mep_110
```
Le script va :
  a. Calculer les millésimes OCSGE disponibles par département (set_departement_millesimes)
  b. Recalculer l'ensemble des projets (reevaluate_project_mep_110)
    - Recalculer couvertures et usages pour avoir les unités en hectare (et plus en km²)
    - Identifier la date de début et de fin de l'OCSGE disponible (millésime)
3. Vérifier manuellement les millésimes OCSGE

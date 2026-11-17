{{
    config(materialized='table')
}}

/*
Taux des cartes bivariées de la carte nationale : une ligne par territoire et par période,
une colonne par taux.

for_app_bivariate_land_rate stocke une ligne par indicateur, dans un ordre quelconque : lire
une période pour toutes les communes y touche environ un tiers des pages de la table
(68 756 pages sur 196 252, soit 537 Mo, mesurées le 12 novembre 2026 sur sa copie dans une
base locale de l'application). Ici les lignes sont écrites triées par maille, période puis
territoire : une maille et une période occupent quelques centaines de pages contiguës
(464 pages lues pour la même période), que la copie vers l'application (dag update_app)
relit et réécrit dans cet ordre.

Les valeurs sont reprises telles quelles de for_app_bivariate_land_rate, sans recalcul ni
arrondi :
- le taux de consommation ne dépend que de la destination (activité, habitat) ;
- le taux de l'indicateur ne dépend que de l'indicateur (emploi, ménages, population).

Seuls les indicateurs et les mailles affichés par la carte sont repris : ce sont ceux de
BIVARIATES et de SCALES dans public_data/domain/ (national_map_indicators.py et national_map.py).
Une colonne conso_rate_<destination> ou indic_rate_<indicateur> est à ajouter ici pour toute
nouvelle carte bivariée.
*/

{% set land_types = [var("REGION"), var("DEPARTEMENT"), var("EPCI"), var("COMMUNE")] %}

SELECT
    land_type,
    start_year,
    end_year,
    land_id,
    max(conso_rate) FILTER (WHERE conso_field = 'activite') AS conso_rate_activite,
    max(conso_rate) FILTER (WHERE conso_field = 'habitat') AS conso_rate_habitat,
    max(indic_rate) FILTER (WHERE indicator = 'emploi') AS indic_rate_emploi,
    max(indic_rate) FILTER (WHERE indicator = 'menages') AS indic_rate_menages,
    max(indic_rate) FILTER (WHERE indicator = 'population') AS indic_rate_population
FROM {{ ref('for_app_bivariate_land_rate') }}
WHERE
    indicator IN ('emploi', 'menages', 'population')
    AND land_type IN ('{{ land_types | join("', '") }}')
GROUP BY land_type, start_year, end_year, land_id
-- Ordre physique de la table : la vue lit une maille et une période, qui doivent être contiguës
ORDER BY land_type, start_year, end_year, land_id

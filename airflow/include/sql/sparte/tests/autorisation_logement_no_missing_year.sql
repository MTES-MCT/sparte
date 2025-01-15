/*
    Ce test vérifie que pour chaque land (commune, epci etc ...) toutes les
    années de données entre 2019 et 2023 sont présentes.
*/
SELECT
    autorisation_logement.land_id,
    autorisation_logement.land_type
FROM
    {{ ref('for_app_autorisationlogement') }} as autorisation_logement
group by
    autorisation_logement.land_id,
    autorisation_logement.land_type
HAVING NOT
    array_agg(autorisation_logement.year) @> array[2019, 2020, 2021, 2022, 2023]

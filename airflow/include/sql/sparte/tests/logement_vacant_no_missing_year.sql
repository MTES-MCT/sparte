/*
    Ce test vérifie que pour chaque land (commune, epci etc ...) toutes les
    années de données entre 2019 et 2023 sont présentes.
*/
SELECT
    logement_vacant.land_id,
    logement_vacant.land_type
FROM
    {{ ref('for_app_logementvacant') }} as logement_vacant
group by
    logement_vacant.land_id,
    logement_vacant.land_type
HAVING NOT
    array_agg(logement_vacant.year) @> array[2020, 2021, 2022, 2023, 2024]

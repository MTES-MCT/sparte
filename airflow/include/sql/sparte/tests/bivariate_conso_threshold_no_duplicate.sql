-- Vérifie qu'il n'y a pas de doublons dans for_app_bivariate_conso_threshold
SELECT
    land_type,
    conso_field,
    start_year,
    end_year,
    count(*) as count_duplicates
FROM
    {{ ref('for_app_bivariate_conso_threshold') }}
GROUP BY
    land_type,
    conso_field,
    start_year,
    end_year
HAVING
    count(*) > 1

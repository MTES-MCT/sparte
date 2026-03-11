-- Vérifie qu'il n'y a pas de doublons dans for_app_bivariate_land_rate
SELECT
    indicator,
    land_id,
    land_type,
    start_year,
    end_year,
    count(*) as count_duplicates
FROM
    {{ ref('for_app_bivariate_land_rate') }}
GROUP BY
    indicator,
    land_id,
    land_type,
    start_year,
    end_year
HAVING
    count(*) > 1

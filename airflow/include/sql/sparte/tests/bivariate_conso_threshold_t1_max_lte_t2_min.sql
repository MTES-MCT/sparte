-- Vérifie que les bornes des terciles conso sont ordonnées : t1_max <= t2_min <= t2_max <= t3_min
SELECT
    land_type,
    conso_field,
    start_year,
    end_year,
    t1_max,
    t2_min,
    t2_max,
    t3_min
FROM
    {{ ref('for_app_bivariate_conso_threshold') }}
WHERE
    t1_max > t2_min
    OR t2_max > t3_min

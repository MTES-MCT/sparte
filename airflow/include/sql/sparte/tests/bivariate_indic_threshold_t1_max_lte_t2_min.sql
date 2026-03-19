-- Vérifie que les bornes des terciles indicateur sont ordonnées : t1_max <= t2_min <= t2_max <= t3_min
SELECT
    indicator,
    land_type,
    start_year,
    end_year,
    t1_max,
    t2_min,
    t2_max,
    t3_min
FROM
    {{ ref('for_app_bivariate_indic_threshold') }}
WHERE
    t1_max > t2_min
    OR t2_max > t3_min

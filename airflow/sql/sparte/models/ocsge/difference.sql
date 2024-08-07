
{{ config(materialized='table') }}

WITH latest_loaded_date AS (
    SELECT
        year_old,
        year_new,
        departement,
        MAX(loaded_date) AS max_loaded_date
    FROM
        {{ source('public', 'ocsge_diff') }}
    GROUP BY
        year_old,
        year_new,
        departement
)
SELECT
    *,
    CASE
        WHEN
            old_is_imper = false AND
            new_is_imper = true
            THEN true
        ELSE false
    END AS new_is_impermeable,
    CASE
        WHEN
            old_is_imper = true AND
            new_is_imper = false
            THEN true
        ELSE false
    END AS new_not_impermeable,
    CASE
        WHEN
            old_is_artif = false AND
            new_is_artif = true
            THEN true
        ELSE false
    END AS new_is_artificial,
    CASE
        WHEN
            old_is_artif = true AND
            new_is_artif = false THEN true
        ELSE false
    END AS new_not_artificial
FROM (
    SELECT
        ocsge.*,
        ST_Area(geom) AS surface,
        {{ is_artificial('cs_old', 'us_old') }} AS old_is_artif,
        {{ is_impermeable('cs_old') }} AS old_is_imper,
        {{ is_artificial('cs_new', 'us_new') }} AS new_is_artif,
        {{ is_impermeable('cs_new') }} AS new_is_imper
    FROM
        {{ source('public', 'ocsge_diff') }} AS ocsge
    JOIN
        latest_loaded_date AS ld
    ON
        ocsge.year_old = ld.year_old
        AND ocsge.year_new = ld.year_new
        AND ocsge.departement = ld.departement
        AND ocsge.loaded_date = ld.max_loaded_date
) AS foo



{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['departement','year'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ]
    )
}}

WITH latest_loaded_date AS (
    SELECT
        year,
        departement,
        MAX(loaded_date) AS max_loaded_date
    FROM
        {{ source('public', 'ocsge_occupation_du_sol') }}
    GROUP BY
        year,
        departement
)
SELECT
    ocsge.*,
    ST_area(geom) AS surface,
    {{ is_impermeable('code_cs') }} as is_impermeable,
    {{ is_artificial('code_cs', 'code_us') }} as is_artificial
FROM
    {{ source('public', 'ocsge_occupation_du_sol') }} AS ocsge
JOIN
    latest_loaded_date AS ld
ON
    ocsge.year = ld.year
    AND ocsge.departement = ld.departement
    AND ocsge.loaded_date = ld.max_loaded_date

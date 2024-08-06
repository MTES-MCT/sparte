-- depends_on: {{ source('public', 'ocsge_occupation_du_sol') }}, {{ source('public', 'ocsge_diff') }}, {{ source('public', 'ocsge_zone_construite') }}

{{
    config(
        materialized='incremental',
        post_hook="DELETE FROM {{ this }} WHERE guid NOT IN (SELECT guid FROM {{ source('public', 'ocsge_diff') }})"
    )
}}

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
        *,
        ST_Area(geom) AS surface,
        {{ is_artificial('cs_old', 'us_old') }} AS old_is_artif,
        {{ is_impermeable('cs_old') }} AS old_is_imper,
        {{ is_artificial('cs_new', 'us_new') }} AS new_is_artif,
        {{ is_impermeable('cs_new') }} AS new_is_imper
    FROM
        {{ source('public', 'ocsge_diff') }}
        {% if is_incremental() %}
            WHERE guid not in (SELECT guid from {{ this }})
        {% endif %}
) AS foo

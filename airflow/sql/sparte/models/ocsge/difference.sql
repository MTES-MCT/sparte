
{{
    config(
        materialized='table',
        post_hook="CREATE INDEX ON {{ this }} USING GIST (geom)"
    )
}}

SELECT
    foo.loaded_date,
    foo.year_old,
    foo.year_new,
    cs_new,
    cs_old,
    us_new,
    us_old,
    foo.departement,
    ST_Area(geom) AS surface,
    uuid,
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
    END AS new_not_artificial,
    geom
FROM (
    SELECT
        ocsge.loaded_date,
        ocsge.year_old,
        ocsge.year_new,
        ocsge.cs_new,
        ocsge.cs_old,
        ocsge.us_new,
        ocsge.us_old,
        ocsge.departement,
        ST_MakeValid(ocsge.geom) AS geom,
        {{ is_artificial('cs_old', 'us_old') }} AS old_is_artif,
        {{ is_impermeable('cs_old') }} AS old_is_imper,
        {{ is_artificial('cs_new', 'us_new') }} AS new_is_artif,
        {{ is_impermeable('cs_new') }} AS new_is_imper,
        ocsge.uuid
    FROM
        {{ source('public', 'ocsge_difference') }} AS ocsge
    WHERE
        cs_new IS NOT NULL AND
        cs_old IS NOT NULL AND
        us_new IS NOT NULL AND
        us_old IS NOT NULL
) AS foo

{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['loaded_date'], 'type': 'btree'},
            {'columns': ['year_old'], 'type': 'btree'},
            {'columns': ['year_new'], 'type': 'btree'},
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'},
            {'columns': ['cs_old'], 'type': 'btree'},
            {'columns': ['cs_new'], 'type': 'btree'},
            {'columns': ['us_old'], 'type': 'btree'},
            {'columns': ['us_new'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ]
    )
}}

SELECT
    foo.year_old,
    foo.year_new,
    foo.cs_new,
    foo.cs_old,
    foo.us_new,
    foo.us_old,
    foo.departement,
    foo.uuid,
    foo.geom,
    2154                          AS srid_source,
    to_timestamp(foo.loaded_date) AS loaded_date,
    st_area(foo.geom)             AS surface,
    coalesce(
        foo.old_is_imper = false
        AND foo.new_is_imper = true, false
    )                             AS new_is_impermeable,
    coalesce(
        foo.old_is_imper = true
        AND foo.new_is_imper = false, false
    )                             AS new_not_impermeable,
    coalesce(
        foo.old_is_artif = false
        AND foo.new_is_artif = true, false
    )                             AS new_is_artificial,
    coalesce(
        foo.old_is_artif = true
        AND foo.new_is_artif = false, false
    )                             AS new_not_artificial
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
        (
            st_dump(st_intersection(departement_table.geom, st_makevalid(ocsge.geom)))
        ).geom as geom,
        {{ is_artificial('cs_old', 'us_old') }} AS old_is_artif,
        {{ is_impermeable('cs_old') }} AS old_is_imper,
        {{ is_artificial('cs_new', 'us_new') }} AS new_is_artif,
        {{ is_impermeable('cs_new') }} AS new_is_imper,
        ocsge.uuid::uuid
    FROM
        {{ source('public', 'ocsge_difference') }} AS ocsge
    left join
        {{ ref("departement") }} as departement_table
        on departement = departement_table.code
    WHERE
        ocsge.cs_new IS NOT null
        AND ocsge.cs_old IS NOT null
        AND ocsge.us_new IS NOT null
        AND ocsge.us_old IS NOT null
) AS foo

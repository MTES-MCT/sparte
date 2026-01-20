{{
    config(
        materialized="table",
        indexes=[{"columns": ["year_old_index", "year_new_index", "departement"], "type": "btree"}]
    )
}}

SELECT
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    artif_difference_commune.departement,
    new_is_artificial,
    new_not_artificial,
    artif_difference_commune.srid_source,
    st_transform(st_centroid(artif_difference_commune.geom), 4326) as geom,
    artif_difference_commune.surface,
    commune_code as "{{ var('COMMUNE')}}",
    commune.epci as "{{ var('EPCI')}}",
    commune.departement as "{{ var('DEPARTEMENT')}}",
    commune.region as "{{ var('REGION')}}",
    commune.scot as "{{ var('SCOT')}}",
    custom_land.custom_lands as "{{ var('CUSTOM')}}"
FROM
    {{ ref("artif_difference_commune")}}
LEFT JOIN LATERAL (
    SELECT *
    FROM
        {{ ref('commune') }} as commune
    WHERE
        commune.code = artif_difference_commune.commune_code
) commune ON TRUE
LEFT JOIN LATERAL (
    SELECT array_agg(custom_land_id) as custom_lands
    FROM
        {{ ref('commune_custom_land') }} as ccl
    WHERE
        ccl.commune_code = artif_difference_commune.commune_code
) custom_land ON TRUE

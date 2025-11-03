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
    cs_new,
    cs_old,
    us_new,
    us_old,
    artif_difference_commune.srid_source,
    st_transform(artif_difference_commune.geom, 4326) as geom,
    artif_difference_commune.surface,
    commune_code as "{{ var('COMMUNE')}}",
    commune.epci as "{{ var('EPCI')}}",
    commune.departement as "{{ var('DEPARTEMENT')}}",
    commune.region as "{{ var('REGION')}}",
    commune.scot as "{{ var('SCOT')}}"
FROM
    {{ ref("artif_difference_commune")}}
 LEFT JOIN LATERAL (
    SELECT *
    FROM
        {{ ref('commune') }} as commune
    WHERE
        commune.code = artif_difference_commune.commune_code
) commune ON TRUE

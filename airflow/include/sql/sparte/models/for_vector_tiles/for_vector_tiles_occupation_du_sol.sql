{{
    config(
        materialized="table",
        indexes=[{"columns": ["year_index", "departement"], "type": "btree"}]
    )
}}

SELECT
    year,
    index as year_index,
    occupation_du_sol_commune.departement,
    code_cs,
    code_us,
    is_artificial,
    is_impermeable,
    occupation_du_sol_commune.srid_source,
    st_transform(occupation_du_sol_commune.geom, 4326) as geom,
    occupation_du_sol_commune.surface,
    commune_code as "{{ var('COMMUNE')}}",
    commune.epci as "{{ var('EPCI')}}",
    commune.departement as "{{ var('DEPARTEMENT')}}",
    commune.region as "{{ var('REGION')}}",
    commune.scot as "{{ var('SCOT')}}",
    custom_land.custom_lands as "{{ var('CUSTOM')}}"
FROM
    {{ ref("occupation_du_sol_commune")}}
LEFT JOIN LATERAL (
    SELECT *
    FROM
        {{ ref('commune') }} as commune
    WHERE
        commune.code = occupation_du_sol_commune.commune_code
) commune ON TRUE
LEFT JOIN LATERAL (
    SELECT array_agg(custom_land_id) as custom_lands
    FROM
        {{ ref('commune_custom_land') }} as ccl
    WHERE
        ccl.commune_code = occupation_du_sol_commune.commune_code
) custom_land ON TRUE

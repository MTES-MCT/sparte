{{
    config(
        materialized="table",
        indexes=[{"columns": ["year_index"], "type": "btree"}]
    )
}}

SELECT
    ocsge_friche_id as id,
    friche_site_id,
    year,
    departement,
    index as year_index,
    code_cs,
    code_us,
    is_artificial,
    is_impermeable,
    surface,
    st_transform(geom, 4326) as geom
FROM
    {{ ref("occupation_du_sol_friche") }}

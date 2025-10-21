
{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
        ],
    )
}}

SELECT
    land_id,
    land_type,
    array_agg(distinct year_old) as years_old,
    array_agg(distinct year_new) as years_new,
    array_agg(distinct departement) as departements,
    year_old_index,
    year_new_index,
    SUM(flux_artif) as flux_artif,
    SUM(flux_desartif) as flux_desartif,
    SUM(flux_artif_net) as flux_artif_net
FROM
    {{ ref('artif_net_flux_land')}}
GROUP BY land_id, land_type, year_old_index, year_new_index

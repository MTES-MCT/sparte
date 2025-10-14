
{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
            {"columns": ["couverture"], "type": "btree"},
        ],
    )
}}

SELECT
    land_id,
    land_type,
    array_agg(distinct departement) as departements,
    array_agg(distinct year_old) as years_old,
    array_agg(distinct year_new) as years_new,
    year_old_index,
    year_new_index,
    couverture,
    sum(flux_artif) as flux_artif,
    sum(flux_desartif) as flux_desartif,
    sum(flux_artif_net) as flux_artif_net
FROM
    {{ ref('artif_flux_land_by_couverture')}}
GROUP BY land_id, land_type, year_old_index, year_new_index, couverture

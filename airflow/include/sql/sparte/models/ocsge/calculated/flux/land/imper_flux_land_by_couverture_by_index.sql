
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
    array_agg(distinct year_old) as years_old,
    array_agg(distinct year_new) as years_new,
    array_agg(distinct departement) as departements,
    year_old_index,
    year_new_index,
    couverture,
    sum(flux_imper) as flux_imper,
    sum(flux_desimper) as flux_desimper,
    sum(flux_imper_net) as flux_imper_net
FROM
    {{ ref('imper_flux_land_by_couverture')}}
GROUP BY land_id, land_type, year_old_index, year_new_index, couverture

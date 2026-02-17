{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

SELECT
    '{{ var("NATION") }}' as code,
    couverture,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    sum(flux_artif) as flux_artif,
    sum(flux_desartif) as flux_desartif,
    sum(flux_artif_net) as flux_artif_net,
    departement
FROM
    {{ ref('artif_flux_region_by_couverture') }}
GROUP BY
    couverture, year_old, year_new, year_old_index, year_new_index, departement

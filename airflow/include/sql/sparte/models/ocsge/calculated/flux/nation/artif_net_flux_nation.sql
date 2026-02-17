{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

SELECT
    '{{ var("NATION") }}' as code,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    sum(flux_artif) as flux_artif,
    sum(flux_desartif) as flux_desartif,
    sum(surface) as surface,
    departement,
    sum(flux_artif) - sum(flux_desartif) as flux_artif_net
FROM
    {{ ref('artif_net_flux_region') }}
GROUP BY
    year_old, year_new, year_old_index, year_new_index, departement

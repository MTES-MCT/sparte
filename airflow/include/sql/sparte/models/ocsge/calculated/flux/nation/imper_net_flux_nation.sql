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
    sum(flux_imper) as flux_imper,
    sum(flux_desimper) as flux_desimper,
    sum(surface) as surface,
    departement,
    sum(flux_imper) - sum(flux_desimper) as flux_imper_net
FROM
    {{ ref('imper_net_flux_region') }}
GROUP BY
    year_old, year_new, year_old_index, year_new_index, departement

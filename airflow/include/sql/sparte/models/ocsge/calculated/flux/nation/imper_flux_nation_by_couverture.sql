{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

SELECT
    '{{ var("NATION") }}' as code,
    departement,
    sum(land_surface) as land_surface,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    couverture,
    sum(flux_imper) as flux_imper,
    sum(flux_desimper) as flux_desimper,
    sum(flux_imper_net) as flux_imper_net
FROM
    {{ ref('imper_flux_region_by_couverture') }}
GROUP BY
    couverture, year_old, year_new, year_old_index, year_new_index, departement
ORDER BY
    code

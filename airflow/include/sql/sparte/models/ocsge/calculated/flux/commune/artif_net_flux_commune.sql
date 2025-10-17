{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

SELECT
    commune_code,
    flux_artif,
    flux_desartif,
    flux_artif_net,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    departement

FROM {{ ref('artif_flux_commune') }}

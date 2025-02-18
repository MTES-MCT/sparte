{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

SELECT
    COALESCE(imper.commune_code, desimper.commune_code) as commune_code,
    COALESCE(impermeable_surface, 0) as impermeable_surface,
    COALESCE(desimper_surface, 0) as desimper_surface,
    COALESCE(impermeable_surface, 0) - COALESCE(desimper_surface, 0) as imper_net,
    COALESCE(imper.year_old, desimper.year_old) as year_old,
    COALESCE(imper.year_new, desimper.year_new) as year_new

FROM {{ ref('imper_flux_commune') }} as imper
INNER JOIN
    {{ ref('desimper_flux_commune') }} as desimper
ON imper.commune_code = desimper.commune_code
AND imper.year_old = desimper.year_old
AND imper.year_new = desimper.year_new

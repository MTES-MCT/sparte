{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}


SELECT
    commune_code, year, sum(percent) as percent, sum(surface) as surface
FROM
    {{ ref('commune_couverture_et_usage')}}
WHERE
    is_impermeable
group by
    commune_code, year

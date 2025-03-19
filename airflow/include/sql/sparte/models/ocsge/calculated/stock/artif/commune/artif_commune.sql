{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}


SELECT
    commune_code,
    year,
    sum(percent) as percent,
    sum(surface) as surface,
    bool_and(official_artif) as official_artif
FROM
    {{ ref('commune_couverture_et_usage')}}
WHERE
    is_artificial
group by
    commune_code, year

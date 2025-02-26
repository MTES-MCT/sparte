{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

with
    without_percent as (
        select
            commune_code,
            year,
            sum(percent) as percent_of_commune,
            sum(surface) as surface,
            code_us as usage
        from {{ ref("commune_couverture_et_usage") }}
        where is_impermeable
        group by commune_code, year, code_us
    )
select
    without_percent.*,
    (without_percent.surface / imper_commune.surface) * 100 as percent_of_imper
from without_percent
left join
    {{ ref("imper_commune") }}
    on without_percent.commune_code = imper_commune.commune_code
    and without_percent.year = imper_commune.year

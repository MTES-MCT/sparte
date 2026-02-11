{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["year", "index"], "type": "btree"},
        ],
    )
}}

with without_percent as (
    select
        zonage_checksum,
        year,
        index,
        zonage_surface,
        sum(case when is_artificial then surface else 0 end) as artif_surface,
        sum(case when is_impermeable then surface else 0 end) as imper_surface
    from
        {{ ref("zonage_couverture_et_usage") }}
    group by
        zonage_checksum, year, index, zonage_surface
),
artif_couverture_agg as (
    select
        zonage_checksum,
        year,
        index,
        json_agg(
            json_build_object('code', code_cs, 'surface', cs_surface)
            order by cs_surface desc
        ) as artif_couverture_composition
    from (
        select
            zonage_checksum, year, index, code_cs,
            sum(surface) as cs_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_artificial
        group by zonage_checksum, year, index, code_cs
    ) sub
    group by zonage_checksum, year, index
),
artif_usage_agg as (
    select
        zonage_checksum,
        year,
        index,
        json_agg(
            json_build_object('code', code_us, 'surface', us_surface)
            order by us_surface desc
        ) as artif_usage_composition
    from (
        select
            zonage_checksum, year, index, code_us,
            sum(surface) as us_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_artificial
        group by zonage_checksum, year, index, code_us
    ) sub
    group by zonage_checksum, year, index
),
imper_couverture_agg as (
    select
        zonage_checksum,
        year,
        index,
        json_agg(
            json_build_object('code', code_cs, 'surface', cs_surface)
            order by cs_surface desc
        ) as imper_couverture_composition
    from (
        select
            zonage_checksum, year, index, code_cs,
            sum(surface) as cs_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_impermeable
        group by zonage_checksum, year, index, code_cs
    ) sub
    group by zonage_checksum, year, index
),
imper_usage_agg as (
    select
        zonage_checksum,
        year,
        index,
        json_agg(
            json_build_object('code', code_us, 'surface', us_surface)
            order by us_surface desc
        ) as imper_usage_composition
    from (
        select
            zonage_checksum, year, index, code_us,
            sum(surface) as us_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_impermeable
        group by zonage_checksum, year, index, code_us
    ) sub
    group by zonage_checksum, year, index
)
select
    wp.zonage_checksum,
    wp.year,
    wp.index,
    wp.zonage_surface,
    wp.artif_surface,
    wp.imper_surface,
    wp.artif_surface / wp.zonage_surface * 100 as artif_percent,
    wp.imper_surface / wp.zonage_surface * 100 as imper_percent,
    ac.artif_couverture_composition,
    au.artif_usage_composition,
    ic.imper_couverture_composition,
    iu.imper_usage_composition
from without_percent wp
left join artif_couverture_agg ac
    on wp.zonage_checksum = ac.zonage_checksum
    and wp.year = ac.year
    and wp.index = ac.index
left join artif_usage_agg au
    on wp.zonage_checksum = au.zonage_checksum
    and wp.year = au.year
    and wp.index = au.index
left join imper_couverture_agg ic
    on wp.zonage_checksum = ic.zonage_checksum
    and wp.year = ic.year
    and wp.index = ic.index
left join imper_usage_agg iu
    on wp.zonage_checksum = iu.zonage_checksum
    and wp.year = iu.year
    and wp.index = iu.index
-- certains zonages PLU ont une surface nulle (géométrie dégénérée
-- ou intersection vide avec l'OCS GE), on les ignore
where wp.zonage_surface > 0

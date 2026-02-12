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
),
-- Flux d'artificialisation entre deux millésimes consécutifs
flux_totals as (
    select
        zonage_checksum,
        year_new_index as index,
        min(year_old) as flux_year_old,
        min(year_new) as flux_year_new,
        round(sum(case when new_is_artificial then st_area(st_transform(geom, srid_source)) else 0 end)::numeric, 4) as flux_artif,
        round(sum(case when new_not_artificial then st_area(st_transform(geom, srid_source)) else 0 end)::numeric, 4) as flux_desartif
    from {{ ref("artif_difference_zonage_urbanisme") }}
    group by zonage_checksum, year_new_index
),
-- Flux net par code couverture : artif (cs_new) - desartif (cs_old)
flux_couverture_agg as (
    select
        zonage_checksum,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_artif_couverture_composition
    from (
        select
            zonage_checksum, index, code,
            sum(surface) as net_surface
        from (
            -- Gains : nouvelles surfaces artificialisées par cs_new
            select zonage_checksum, year_new_index as index, cs_new as code,
                round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_is_artificial
            group by zonage_checksum, year_new_index, cs_new
            union all
            -- Pertes : surfaces désartificialisées par cs_old (négatif)
            select zonage_checksum, year_new_index as index, cs_old as code,
                -round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_not_artificial
            group by zonage_checksum, year_new_index, cs_old
        ) combined
        group by zonage_checksum, index, code
    ) sub
    where net_surface != 0
    group by zonage_checksum, index
),
-- Flux net par code usage : artif (us_new) - desartif (us_old)
flux_usage_agg as (
    select
        zonage_checksum,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_artif_usage_composition
    from (
        select
            zonage_checksum, index, code,
            sum(surface) as net_surface
        from (
            -- Gains : nouvelles surfaces artificialisées par us_new
            select zonage_checksum, year_new_index as index, us_new as code,
                round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_is_artificial
            group by zonage_checksum, year_new_index, us_new
            union all
            -- Pertes : surfaces désartificialisées par us_old (négatif)
            select zonage_checksum, year_new_index as index, us_old as code,
                -round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_not_artificial
            group by zonage_checksum, year_new_index, us_old
        ) combined
        group by zonage_checksum, index, code
    ) sub
    where net_surface != 0
    group by zonage_checksum, index
),
-- Flux d'imperméabilisation entre deux millésimes consécutifs
imper_flux_totals as (
    select
        zonage_checksum,
        year_new_index as index,
        round(sum(case when new_is_impermeable then st_area(st_transform(geom, srid_source)) else 0 end)::numeric, 4) as flux_imper,
        round(sum(case when new_not_impermeable then st_area(st_transform(geom, srid_source)) else 0 end)::numeric, 4) as flux_desimper
    from {{ ref("imper_difference_zonage_urbanisme") }}
    group by zonage_checksum, year_new_index
),
-- Flux net imper par code couverture : imper (cs_new) - desimper (cs_old)
imper_flux_couverture_agg as (
    select
        zonage_checksum,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_imper_couverture_composition
    from (
        select
            zonage_checksum, index, code,
            sum(surface) as net_surface
        from (
            select zonage_checksum, year_new_index as index, cs_new as code,
                round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_is_impermeable
            group by zonage_checksum, year_new_index, cs_new
            union all
            select zonage_checksum, year_new_index as index, cs_old as code,
                -round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_not_impermeable
            group by zonage_checksum, year_new_index, cs_old
        ) combined
        group by zonage_checksum, index, code
    ) sub
    where net_surface != 0
    group by zonage_checksum, index
),
-- Flux net imper par code usage : imper (us_new) - desimper (us_old)
imper_flux_usage_agg as (
    select
        zonage_checksum,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_imper_usage_composition
    from (
        select
            zonage_checksum, index, code,
            sum(surface) as net_surface
        from (
            select zonage_checksum, year_new_index as index, us_new as code,
                round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_is_impermeable
            group by zonage_checksum, year_new_index, us_new
            union all
            select zonage_checksum, year_new_index as index, us_old as code,
                -round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_not_impermeable
            group by zonage_checksum, year_new_index, us_old
        ) combined
        group by zonage_checksum, index, code
    ) sub
    where net_surface != 0
    group by zonage_checksum, index
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
    iu.imper_usage_composition,
    ft.flux_year_old,
    ft.flux_year_new,
    ft.flux_artif,
    ft.flux_desartif,
    ft.flux_artif - ft.flux_desartif as flux_artif_net,
    ft.flux_artif / wp.zonage_surface * 100 as flux_artif_percent,
    ft.flux_desartif / wp.zonage_surface * 100 as flux_desartif_percent,
    (ft.flux_artif - ft.flux_desartif) / wp.zonage_surface * 100 as flux_artif_net_percent,
    fc.flux_artif_couverture_composition,
    fu.flux_artif_usage_composition,
    ift.flux_imper,
    ift.flux_desimper,
    ift.flux_imper - ift.flux_desimper as flux_imper_net,
    ift.flux_imper / wp.zonage_surface * 100 as flux_imper_percent,
    ift.flux_desimper / wp.zonage_surface * 100 as flux_desimper_percent,
    (ift.flux_imper - ift.flux_desimper) / wp.zonage_surface * 100 as flux_imper_net_percent,
    ifc.flux_imper_couverture_composition,
    ifu.flux_imper_usage_composition
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
left join flux_totals ft
    on wp.zonage_checksum = ft.zonage_checksum
    and wp.index = ft.index
left join flux_couverture_agg fc
    on wp.zonage_checksum = fc.zonage_checksum
    and wp.index = fc.index
left join flux_usage_agg fu
    on wp.zonage_checksum = fu.zonage_checksum
    and wp.index = fu.index
left join imper_flux_totals ift
    on wp.zonage_checksum = ift.zonage_checksum
    and wp.index = ift.index
left join imper_flux_couverture_agg ifc
    on wp.zonage_checksum = ifc.zonage_checksum
    and wp.index = ifc.index
left join imper_flux_usage_agg ifu
    on wp.zonage_checksum = ifu.zonage_checksum
    and wp.index = ifu.index
-- certains zonages PLU ont une surface nulle (géométrie dégénérée
-- ou intersection vide avec l'OCS GE), on les ignore
where wp.zonage_surface > 0

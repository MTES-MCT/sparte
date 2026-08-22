{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["part_id"], "type": "btree"},
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["year", "index"], "type": "btree"},
        ],
    )
}}

/*
Statistiques d'artificialisation et d'imperméabilisation par zonage d'urbanisme,
au grain PART (zonage × commune).

Ce modèle n'a qu'un seul consommateur, `for_vector_tiles_zonage_urbanisme`, et la
carte affiche désormais les parts : un zonage à cheval sur trois communes est servi
comme trois objets, avec les statistiques de chacun. Le rollup par
`zonage_checksum` n'a donc plus d'objet — `zonage_checksum` reste porté comme
attribut, pour recomposer si besoin.

Dénominateur de tous les pourcentages : `part_surface`. Pas `zonage_surface`, qui
porte le zonage entier, mer comprise en zone littorale (les PLU zonent la mer,
Admin Express s'arrête au trait de côte) alors que l'OCS GE ne couvre que le
terrestre — les pourcentages des zonages littoraux étaient mécaniquement écrasés.

La structure en CTE quasi identiques est conservée telle quelle : un seul type de
changement à valider à la fois.
*/

with without_percent as (
    select
        part_id,
        zonage_checksum,
        commune_code,
        year,
        index,
        part_surface,
        sum(case when is_artificial then surface else 0 end) as artif_surface,
        sum(case when is_impermeable then surface else 0 end) as imper_surface
    from
        {{ ref("zonage_couverture_et_usage") }}
    group by
        part_id, zonage_checksum, commune_code, year, index, part_surface
),
artif_couverture_agg as (
    select
        part_id,
        year,
        index,
        json_agg(
            json_build_object('code', code_cs, 'surface', cs_surface)
            order by cs_surface desc
        ) as artif_couverture_composition
    from (
        select
            part_id, year, index, code_cs,
            sum(surface) as cs_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_artificial
        group by part_id, year, index, code_cs
    ) sub
    group by part_id, year, index
),
artif_usage_agg as (
    select
        part_id,
        year,
        index,
        json_agg(
            json_build_object('code', code_us, 'surface', us_surface)
            order by us_surface desc
        ) as artif_usage_composition
    from (
        select
            part_id, year, index, code_us,
            sum(surface) as us_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_artificial
        group by part_id, year, index, code_us
    ) sub
    group by part_id, year, index
),
imper_couverture_agg as (
    select
        part_id,
        year,
        index,
        json_agg(
            json_build_object('code', code_cs, 'surface', cs_surface)
            order by cs_surface desc
        ) as imper_couverture_composition
    from (
        select
            part_id, year, index, code_cs,
            sum(surface) as cs_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_impermeable
        group by part_id, year, index, code_cs
    ) sub
    group by part_id, year, index
),
imper_usage_agg as (
    select
        part_id,
        year,
        index,
        json_agg(
            json_build_object('code', code_us, 'surface', us_surface)
            order by us_surface desc
        ) as imper_usage_composition
    from (
        select
            part_id, year, index, code_us,
            sum(surface) as us_surface
        from {{ ref("zonage_couverture_et_usage") }}
        where is_impermeable
        group by part_id, year, index, code_us
    ) sub
    group by part_id, year, index
),
-- Flux d'artificialisation entre deux millésimes consécutifs.
-- `surface` est déjà calculée en amont, sur une géométrie déjà projetée en
-- `srid_source` : le `st_area(st_transform(geom, srid_source))` de la version
-- précédente retransformait une géométrie qui l'était déjà.
flux_totals as (
    select
        part_id,
        year_new_index as index,
        min(year_old) as flux_year_old,
        min(year_new) as flux_year_new,
        round(sum(case when new_is_artificial then surface else 0 end)::numeric, 4) as flux_artif,
        round(sum(case when new_not_artificial then surface else 0 end)::numeric, 4) as flux_desartif
    from {{ ref("artif_difference_zonage_urbanisme") }}
    group by part_id, year_new_index
),
-- Flux net par code couverture : artif (cs_new) - desartif (cs_old)
flux_couverture_agg as (
    select
        part_id,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_artif_couverture_composition
    from (
        select
            part_id, index, code,
            sum(surface) as net_surface
        from (
            -- Gains : nouvelles surfaces artificialisées par cs_new
            select part_id, year_new_index as index, cs_new as code,
                round(sum(surface)::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_is_artificial
            group by part_id, year_new_index, cs_new
            union all
            -- Pertes : surfaces désartificialisées par cs_old (négatif)
            select part_id, year_new_index as index, cs_old as code,
                -round(sum(surface)::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_not_artificial
            group by part_id, year_new_index, cs_old
        ) combined
        group by part_id, index, code
    ) sub
    where net_surface != 0
    group by part_id, index
),
-- Flux net par code usage : artif (us_new) - desartif (us_old)
flux_usage_agg as (
    select
        part_id,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_artif_usage_composition
    from (
        select
            part_id, index, code,
            sum(surface) as net_surface
        from (
            -- Gains : nouvelles surfaces artificialisées par us_new
            select part_id, year_new_index as index, us_new as code,
                round(sum(surface)::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_is_artificial
            group by part_id, year_new_index, us_new
            union all
            -- Pertes : surfaces désartificialisées par us_old (négatif)
            select part_id, year_new_index as index, us_old as code,
                -round(sum(surface)::numeric, 4) as surface
            from {{ ref("artif_difference_zonage_urbanisme") }}
            where new_not_artificial
            group by part_id, year_new_index, us_old
        ) combined
        group by part_id, index, code
    ) sub
    where net_surface != 0
    group by part_id, index
),
-- Flux d'imperméabilisation entre deux millésimes consécutifs
imper_flux_totals as (
    select
        part_id,
        year_new_index as index,
        round(sum(case when new_is_impermeable then surface else 0 end)::numeric, 4) as flux_imper,
        round(sum(case when new_not_impermeable then surface else 0 end)::numeric, 4) as flux_desimper
    from {{ ref("imper_difference_zonage_urbanisme") }}
    group by part_id, year_new_index
),
-- Flux net imper par code couverture : imper (cs_new) - desimper (cs_old)
imper_flux_couverture_agg as (
    select
        part_id,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_imper_couverture_composition
    from (
        select
            part_id, index, code,
            sum(surface) as net_surface
        from (
            select part_id, year_new_index as index, cs_new as code,
                round(sum(surface)::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_is_impermeable
            group by part_id, year_new_index, cs_new
            union all
            select part_id, year_new_index as index, cs_old as code,
                -round(sum(surface)::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_not_impermeable
            group by part_id, year_new_index, cs_old
        ) combined
        group by part_id, index, code
    ) sub
    where net_surface != 0
    group by part_id, index
),
-- Flux net imper par code usage : imper (us_new) - desimper (us_old)
imper_flux_usage_agg as (
    select
        part_id,
        index,
        json_agg(
            json_build_object('code', code, 'surface', net_surface)
            order by net_surface desc
        ) as flux_imper_usage_composition
    from (
        select
            part_id, index, code,
            sum(surface) as net_surface
        from (
            select part_id, year_new_index as index, us_new as code,
                round(sum(surface)::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_is_impermeable
            group by part_id, year_new_index, us_new
            union all
            select part_id, year_new_index as index, us_old as code,
                -round(sum(surface)::numeric, 4) as surface
            from {{ ref("imper_difference_zonage_urbanisme") }}
            where new_not_impermeable
            group by part_id, year_new_index, us_old
        ) combined
        group by part_id, index, code
    ) sub
    where net_surface != 0
    group by part_id, index
)
select
    wp.part_id,
    wp.zonage_checksum,
    wp.commune_code,
    wp.year,
    wp.index,
    wp.part_surface,
    wp.artif_surface,
    wp.imper_surface,
    wp.artif_surface / wp.part_surface * 100 as artif_percent,
    wp.imper_surface / wp.part_surface * 100 as imper_percent,
    ac.artif_couverture_composition,
    au.artif_usage_composition,
    ic.imper_couverture_composition,
    iu.imper_usage_composition,
    ft.flux_year_old,
    ft.flux_year_new,
    ft.flux_artif,
    ft.flux_desartif,
    ft.flux_artif - ft.flux_desartif as flux_artif_net,
    ft.flux_artif / wp.part_surface * 100 as flux_artif_percent,
    ft.flux_desartif / wp.part_surface * 100 as flux_desartif_percent,
    (ft.flux_artif - ft.flux_desartif) / wp.part_surface * 100 as flux_artif_net_percent,
    fc.flux_artif_couverture_composition,
    fu.flux_artif_usage_composition,
    ift.flux_imper,
    ift.flux_desimper,
    ift.flux_imper - ift.flux_desimper as flux_imper_net,
    ift.flux_imper / wp.part_surface * 100 as flux_imper_percent,
    ift.flux_desimper / wp.part_surface * 100 as flux_desimper_percent,
    (ift.flux_imper - ift.flux_desimper) / wp.part_surface * 100 as flux_imper_net_percent,
    ifc.flux_imper_couverture_composition,
    ifu.flux_imper_usage_composition
from without_percent wp
left join artif_couverture_agg ac
    on wp.part_id = ac.part_id
    and wp.year = ac.year
    and wp.index = ac.index
left join artif_usage_agg au
    on wp.part_id = au.part_id
    and wp.year = au.year
    and wp.index = au.index
left join imper_couverture_agg ic
    on wp.part_id = ic.part_id
    and wp.year = ic.year
    and wp.index = ic.index
left join imper_usage_agg iu
    on wp.part_id = iu.part_id
    and wp.year = iu.year
    and wp.index = iu.index
left join flux_totals ft
    on wp.part_id = ft.part_id
    and wp.index = ft.index
left join flux_couverture_agg fc
    on wp.part_id = fc.part_id
    and wp.index = fc.index
left join flux_usage_agg fu
    on wp.part_id = fu.part_id
    and wp.index = fu.index
left join imper_flux_totals ift
    on wp.part_id = ift.part_id
    and wp.index = ift.index
left join imper_flux_couverture_agg ifc
    on wp.part_id = ifc.part_id
    and wp.index = ifc.index
left join imper_flux_usage_agg ifu
    on wp.part_id = ifu.part_id
    and wp.index = ifu.index
-- Plus de garde `where zonage_surface > 0` : `zonage_urbanisme_commune` filtre les
-- parts de surface arrondie nulle, `part_surface` vaut donc au minimum 0,0001 m².
-- Les 70 zonages de surface dégénérée ne produisent aucune part.

{{ config(materialized="table") }}

with
    artif_commune_with_row_number as (
        -- Marque les données les plus récentes pour chaque commune (rn = 1)
        select
            code as commune_code,
            percent,
            artificial_surface as surface,
            year,
            row_number() over (partition by code order by year desc) as rn
        from
            {{ ref("artif_commune") }} as artif
        order by year desc
    ),
    latest_artif_commune as (
        -- Sélectionne les données les plus récentes pour chaque commune
        select commune_code, percent, surface, year
        from artif_commune_with_row_number
        where rn = 1
    )
select
    latest_artif_commune.commune_code,
    commune.name as nom,
    latest_artif_commune.percent as pourcent_artif,
    latest_artif_commune.surface as surface_artif,
    latest_artif_commune.year as ocsge_millesime,
    commune.population as population,
    commune.canton as canton,
    commune.departement as departement,
    commune.region as region,
    commune.ept as ept,
    commune.epci as epci,
    commune.scot as scot,
    commune.surface as commune_surface,
    st_transform(commune.geom, 4326) as geom
from latest_artif_commune
left join
    {{ ref("commune") }} as commune on latest_artif_commune.commune_code = commune.code

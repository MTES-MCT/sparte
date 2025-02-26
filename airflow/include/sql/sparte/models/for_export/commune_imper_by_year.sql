{{ config(materialized="table") }}

with
    imper_commune_with_row_number as (
        -- Marque les données les plus récentes pour chaque commune (rn = 1)
        select
            commune_code,
            percent,
            surface,
            year,
            row_number() over (partition by commune_code order by year desc) as rn
        from {{ ref("imper_commune") }} as imper
        order by year desc
    ),
    latest_imper_commune as (
        -- Sélectionne les données les plus récentes pour chaque commune
        select commune_code, percent, surface, year
        from imper_commune_with_row_number
        where rn = 1
    )
select
    latest_imper_commune.commune_code,
    commune.name as nom,
    latest_imper_commune.percent as pourcent_imper,
    latest_imper_commune.surface as surface_imper,
    latest_imper_commune.year as ocsge_millesime,
    commune.population as population,
    commune.canton as canton,
    commune.departement as departement,
    commune.region as region,
    commune.ept as ept,
    commune.epci as epci,
    commune.scot as scot,
    commune.surface as commune_surface,
    st_transform(commune.geom, 4326) as geom
from latest_imper_commune
left join
    {{ ref("commune") }} as commune on latest_imper_commune.commune_code = commune.code

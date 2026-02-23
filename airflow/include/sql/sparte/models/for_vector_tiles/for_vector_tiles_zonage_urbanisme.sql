{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["year_index", "departement"], "type": "btree"},
        ],
    )
}}

select
    zonage.checksum,
    zonage.type_zone,
    zonage.libelle,
    zonage.libelle_long,
    zonage.destination_dominante,
    zonage.date_approbation,
    zonage.date_validation,
    zonage.id_document_urbanisme,
    zonage.surface as zonage_surface,
    zonage.departement,
    zonage.srid_source,
    commune.name as commune_name,
    stats.year,
    stats.index as year_index,
    stats.artif_surface,
    stats.artif_percent,
    stats.imper_surface,
    stats.imper_percent,
    stats.artif_couverture_composition,
    stats.artif_usage_composition,
    stats.imper_couverture_composition,
    stats.imper_usage_composition,
    stats.flux_year_old,
    stats.flux_year_new,
    stats.flux_artif,
    stats.flux_desartif,
    stats.flux_artif_net,
    stats.flux_artif_percent,
    stats.flux_desartif_percent,
    stats.flux_artif_net_percent,
    stats.flux_artif_couverture_composition,
    stats.flux_artif_usage_composition,
    stats.flux_imper,
    stats.flux_desimper,
    stats.flux_imper_net,
    stats.flux_imper_percent,
    stats.flux_desimper_percent,
    stats.flux_imper_net_percent,
    stats.flux_imper_couverture_composition,
    stats.flux_imper_usage_composition,
    Box2D(st_transform(zonage.geom, 4326))::text as extent,
    st_transform(zonage.geom, 4326) as geom,
    zonage.commune_code as "{{ var('COMMUNE') }}",
    commune.epci as "{{ var('EPCI') }}",
    commune.departement as "{{ var('DEPARTEMENT') }}",
    commune.region as "{{ var('REGION') }}",
    commune.scot as "{{ var('SCOT') }}",
    custom_land.custom_lands as "{{ var('CUSTOM') }}"
from
    {{ ref("zonage_urbanisme") }} as zonage
left join
    {{ ref("zonage_urbanisme_artif_imper_stats") }} as stats
    on zonage.checksum = stats.zonage_checksum
left join lateral (
    select *
    from
        {{ ref('commune') }} as commune
    where
        commune.code = zonage.commune_code
) commune on true
left join lateral (
    select array_agg(custom_land_id) as custom_lands
    from
        {{ ref('commune_custom_land') }} as ccl
    where
        ccl.commune_code = zonage.commune_code
) custom_land on true

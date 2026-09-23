{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["year_index", '"DEPART"'], "type": "btree"},
        ],
    )
}}

/*
Tuiles vectorielles des zonages d'urbanisme, au grain PART (zonage × commune).

Une feature par couple (zonage, commune) : un zonage à cheval sur trois communes
est servi comme trois objets. C'est assumé — le produit affiche des parts, et la
géométrie servie coïncide enfin avec celle sur laquelle les statistiques sont
calculées.

Ce que ça remplace : la version précédente partait de `zonage_urbanisme` et
joignait `zonage_commune` pour l'étiquetage territorial. Un zonage touchant N
communes produisait déjà N features de géométrie IDENTIQUE, chacune étiquetée
d'une commune différente — la duplication existait donc, mais sans découpage, si
bien qu'à l'échelle communale un zonage débordait sur ses voisines.

Conséquence pour le front : `part_id` remplace `checksum` comme identifiant de
feature (survol, verrouillage), et `part_surface` remplace `zonage_surface` comme
surface affichée. `zonage_checksum` et `zonage_surface` restent exposés pour qui
veut remonter au zonage entier.

La jointure sur `commune` est une jointure interne : `commune_code` provient du
découpage, il ne peut pas être nul.
*/

select
    zonage.part_id,
    zonage.zonage_checksum,
    zonage.type_zone,
    zonage.libelle,
    zonage.libelle_long,
    zonage.destination_dominante,
    zonage.date_approbation,
    zonage.date_validation,
    zonage.id_document_urbanisme,
    zonage.part_surface,
    zonage.zonage_surface,
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
    {{ ref("zonage_urbanisme_commune") }} as zonage
inner join
    {{ ref('commune') }} as commune
    on commune.code = zonage.commune_code
left join
    {{ ref("zonage_urbanisme_artif_imper_stats") }} as stats
    on stats.part_id = zonage.part_id
left join lateral (
    select array_agg(custom_land_id) as custom_lands
    from
        {{ ref('commune_custom_land') }} as ccl
    where
        ccl.commune_code = zonage.commune_code
) custom_land on true

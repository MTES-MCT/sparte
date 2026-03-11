{% macro merge_ocsge_zonage_commune(where_condition) %}

with
    without_percent as (
        select
            zc.commune_code as commune,
            commune.departement,
            zonage_couverture_et_usage.index,
            commune.region,
            commune.epci,
            commune.ept,
            scot_communes.id_scot as scot,
            count(distinct zc.zonage_checksum)::integer as zonage_count,
            sum(zonage_couverture_et_usage.surface) as zonage_surface,
            sum(
                case
                    zonage_couverture_et_usage.{{ where_condition }}
                    when true
                    then zonage_couverture_et_usage.surface
                    else 0
                end
            ) as indicateur_surface,
            zonage_type,
            year
        from {{ ref("zonage_commune") }} as zc
        inner join {{ ref("commune") }} as commune on commune.code = zc.commune_code
        left join {{ ref("scot_communes") }} as scot_communes on commune.code = scot_communes.commune_code
        left join
            {{ ref("zonage_couverture_et_usage") }}
            on zc.zonage_checksum = zonage_couverture_et_usage.zonage_checksum
        where zonage_type is not null
        group by zc.commune_code, zonage_type, year, commune.departement, zonage_couverture_et_usage.index, commune.region, commune.epci, commune.ept, scot_communes.id_scot
    )
select
    commune as code,
    departement,
    region,
    epci,
    ept,
    scot,
    year,
    index,
    zonage_surface,
    indicateur_surface,
    zonage_type,
    zonage_count,
    indicateur_surface / zonage_surface * 100 as indicateur_percent
from without_percent
-- certains zonages PLU ont une surface nulle (géométrie dégénérée ou intersection
-- vide avec l'OCS GE), on les ignore car marginaux (2 sur ~159 000)
where zonage_surface > 0

{% endmacro %}

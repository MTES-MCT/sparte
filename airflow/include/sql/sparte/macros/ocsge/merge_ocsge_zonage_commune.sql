{% macro merge_ocsge_zonage_commune(where_condition) %}

with
    without_percent as (
        select
            commune,
            departement,
            index,
            region,
            epci,
            ept,
            scot,
            count(distinct land_zonage.zonage_checksum)::integer as zonage_count,
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
        from {{ ref("commune_zonage") }} as land_zonage
        left join
            {{ ref("zonage_couverture_et_usage") }}
            on land_zonage.zonage_checksum = zonage_couverture_et_usage.zonage_checksum
        where zonage_type is not null
        group by commune, zonage_type, year, departement, index, region, epci, ept, scot
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

{% endmacro %}

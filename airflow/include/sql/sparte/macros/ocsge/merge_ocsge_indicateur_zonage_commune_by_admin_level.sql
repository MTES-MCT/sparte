{% macro merge_ocsge_indicateur_zonage_commune_by_admin_level(indicateur, group_by_column) %}

{% set where_conditions = {'artif': 'is_artificial', 'imper': 'is_impermeable'} %}
{% set where_condition = where_conditions[indicateur] %}
{% set zonage_admin_model = 'zonage_' + group_by_column %}
{% set admin_code_column = group_by_column + '_code' %}

    with
        without_percent as (
            select
                za.{{ admin_code_column }} as code,
                {% if group_by_column == 'departement' %}
                za.departement_code as departement,
                {% else %}
                zd.departement_code as departement,
                {% endif %}
                zonage_couverture_et_usage.index,
                count(distinct za.zonage_checksum)::integer as zonage_count,
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
            from {{ ref(zonage_admin_model) }} as za
            {% if group_by_column != 'departement' %}
            left join {{ ref("zonage_departement") }} as zd
                on za.zonage_checksum = zd.zonage_checksum
            {% endif %}
            left join
                {{ ref("zonage_couverture_et_usage") }}
                on za.zonage_checksum = zonage_couverture_et_usage.zonage_checksum
            where zonage_type is not null
            group by
                za.{{ admin_code_column }},
                {% if group_by_column == 'departement' %}
                za.departement_code,
                {% else %}
                zd.departement_code,
                {% endif %}
                zonage_type, year, zonage_couverture_et_usage.index
        )
    select
        code,
        departement,
        year,
        index,
        zonage_surface,
        indicateur_surface,
        indicateur_surface / zonage_surface * 100 as indicateur_percent,
        zonage_type,
        zonage_count
    from without_percent
    where zonage_surface > 0

{% endmacro %}

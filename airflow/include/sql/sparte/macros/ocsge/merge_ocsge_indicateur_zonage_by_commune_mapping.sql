{% macro merge_ocsge_indicateur_zonage_by_commune_mapping(indicateur, code_expression, mapping_model=none) %}

{% set where_conditions = {'artif': 'is_artificial', 'imper': 'is_impermeable'} %}
{% set where_condition = where_conditions[indicateur] %}

/*
Agrégation des zonages sur un territoire dont la composition communale ne se lit
pas dans une colonne de `commune` : territoires personnalisés (via une table de
correspondance commune → territoire), ou national (toutes les communes).

Même principe que `merge_ocsge_indicateur_zonage_commune_by_admin_level` : on part
du grain part porté par `zonage_couverture_et_usage` et on groupe directement.

Ce que ça corrige : ces agrégats sommaient `zonage_count` depuis l'échelon
inférieur, si bien qu'un zonage présent dans plusieurs communes du territoire
était compté autant de fois qu'il y avait de communes. `count(distinct)` sur le
grain part le compte une fois. Les surfaces, elles, se somment sans risque depuis
que les parts sont disjointes — ce n'était pas le cas avant le découpage.

La ventilation par `departement` de la sortie est conservée telle quelle : un
territoire à cheval sur deux départements produit toujours une ligne par
département.
*/

    with without_percent as (
        select
            {{ code_expression }} as code,
            commune.departement,
            zcu.index,
            zcu.zonage_type,
            zcu.year,
            count(distinct zcu.zonage_checksum)::integer as zonage_count,
            sum(zcu.surface) as zonage_surface,
            sum(
                case when zcu.{{ where_condition }} then zcu.surface else 0 end
            ) as indicateur_surface
        from {{ ref("zonage_couverture_et_usage") }} as zcu
        inner join {{ ref("commune") }} as commune on commune.code = zcu.commune_code
        {%- if mapping_model %}
        inner join {{ ref(mapping_model) }} as mapping
            on mapping.commune_code = zcu.commune_code
            and {{ code_expression }} is not null
        {%- endif %}
        where zcu.zonage_type is not null
        group by
            {%- if mapping_model %}
            {{ code_expression }},
            {%- endif %}
            commune.departement,
            zcu.index,
            zcu.zonage_type,
            zcu.year
    )
    select
        code,
        year,
        index,
        departement,
        zonage_surface,
        indicateur_surface,
        indicateur_surface / zonage_surface * 100 as indicateur_percent,
        zonage_type,
        zonage_count
    from without_percent
    where zonage_surface > 0

{% endmacro %}

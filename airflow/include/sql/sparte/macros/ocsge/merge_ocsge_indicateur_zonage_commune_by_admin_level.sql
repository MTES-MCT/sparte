{% macro merge_ocsge_indicateur_zonage_commune_by_admin_level(indicateur, group_by_column) %}

{% set where_conditions = {'artif': 'is_artificial', 'imper': 'is_impermeable'} %}
{% set where_condition = where_conditions[indicateur] %}

/*
Même agrégation que `merge_ocsge_zonage_commune`, remontée à un échelon
administratif supérieur : {{ group_by_column }}.

`zonage_couverture_et_usage` est au grain part (zonage × commune) et `commune`
porte déjà `departement`, `region`, `epci` et `scot` : l'échelon s'obtient par une
jointure sur la commune, sans passer par les tables de correspondance
`zonage_departement` / `zonage_epci` / `zonage_region` / `zonage_scot`.

Ces tables dérivaient de `zonage_commune`, qui rattachait un zonage ENTIER à
chaque commune touchée : un zonage à cheval voyait sa surface intégrale comptée
dans chaque territoire. Un zonage traversant une frontière départementale
apparaissait de surcroît dans les deux départements avec 100 % de sa surface.

La colonne `departement` de sortie reste celle de la commune, si bien qu'un EPCI
ou un SCoT à cheval sur deux départements produit toujours une ligne par
département — la clé de sortie est inchangée.

`count(distinct)` est impératif : une part apparaît sur autant de lignes qu'elle
a de combinaisons couverture × usage, et un même zonage peut avoir des parts dans
plusieurs communes du territoire.
*/

    with
        without_percent as (
            select
                commune.{{ group_by_column }} as code,
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
            where zcu.zonage_type is not null
              and commune.{{ group_by_column }} is not null
            group by
                commune.{{ group_by_column }},
                commune.departement,
                zcu.index,
                zcu.zonage_type,
                zcu.year
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

{% macro merge_ocsge_zonage_commune(where_condition) %}

/*
Agrégation par commune des surfaces OCS GE croisées avec les zonages d'urbanisme.

`zonage_couverture_et_usage` étant au grain part (zonage × commune), le
rattachement territorial est porté par la donnée elle-même : plus de jointure sur
une table de correspondance, un simple `group by commune_code`.

Ce que corrige ce changement : la version précédente partait de `zonage_commune`,
qui associait un zonage ENTIER à chacune des communes qu'il touchait, puis
joignait les surfaces sur `zonage_checksum`. Un zonage à cheval sur 3 communes
faisait donc compter sa surface intégrale dans les 3. 19 % des zonages sont
concernés, et `zonage_surface`, `indicateur_surface`, `indicateur_percent` et
`zonage_count` en étaient tous gonflés.

`zonage_count` compte désormais les zonages ayant au moins un objet OCS GE dans
la commune, et non plus ceux qui la touchent. `count(distinct)` est impératif :
une part apparaît sur autant de lignes qu'elle a de combinaisons couverture ×
usage.

`commune.scot` est déjà alimenté depuis `scot_communes` dans le modèle `commune`,
la jointure supplémentaire de la version précédente était redondante.
*/

with
    without_percent as (
        select
            zcu.commune_code as commune,
            commune.departement,
            commune.region,
            commune.epci,
            commune.ept,
            commune.scot,
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
        group by
            zcu.commune_code,
            commune.departement,
            commune.region,
            commune.epci,
            commune.ept,
            commune.scot,
            zcu.index,
            zcu.zonage_type,
            zcu.year
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
where zonage_surface > 0

{% endmacro %}

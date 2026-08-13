{% test unique_geom(model, column_name) %}

/*
    Unicité STRICTE des géométries : deux lignes sont en doublon si leurs
    géométries sont identiques au sens ST_OrderingEquals (mêmes sommets, même
    ordre, même orientation) — pas seulement même bounding box.

    RAPPEL (à toi du futur) : le test `unique` standard de dbt fait un
    GROUP BY sur la colonne. Sur une colonne geometry, l'opérateur `=` de PostGIS
    (>= 2.4) compare déjà les coordonnées ET leur ordre — donc `unique` est en
    pratique très proche de ST_OrderingEquals. Ce test-ci rend l'intention
    explicite et ne dépend pas de la version de PostGIS.

    Perf : pré-filtre par bounding box (`&&`, utilise l'index gist) avant le
    ST_OrderingEquals qui est coûteux. `ctid` sert à distinguer deux lignes
    distinctes (la table est matérialisée).
*/

with duplicates as (

    select a.{{ column_name }}
    from {{ model }} as a
    join {{ model }} as b
        on a.ctid <> b.ctid
       and a.{{ column_name }} && b.{{ column_name }}
       and st_orderingequals(a.{{ column_name }}, b.{{ column_name }})

)

select * from duplicates

{% endtest %}

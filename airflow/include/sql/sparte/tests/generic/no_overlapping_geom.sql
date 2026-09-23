{% test no_overlapping_geom(model, column_name, tolerance=1) %}

/*
    Vérifie qu'aucune paire de features ne se chevauche, au sens où leur
    intersection a une aire strictement positive (> tolerance). Deux polygones
    qui se touchent uniquement par leur frontière (aire d'intersection nulle) ne
    sont PAS considérés comme en chevauchement.

    Perf : pré-filtre par bounding box (`&&`, utilise l'index gist) avant les
    appels coûteux ST_Intersects / ST_Intersection / ST_Area. `a.ctid < b.ctid`
    distingue deux lignes ET évite de tester deux fois la même paire (a,b)/(b,a).

    Tolérance : exprimée dans l'unité du SRID de la colonne (m² pour un SRID
    projeté). Par défaut 1 pour absorber les slivers dus aux imprécisions de
    découpage/union des géométries.
*/

with overlapping_pairs as (

    select
        a.{{ column_name }} as geom_a,
        b.{{ column_name }} as geom_b
    from {{ model }} as a
    join {{ model }} as b
        on a.ctid < b.ctid
       and a.{{ column_name }} && b.{{ column_name }}
       and st_intersects(a.{{ column_name }}, b.{{ column_name }})
       and not st_touches(a.{{ column_name }}, b.{{ column_name }})
       and st_area(st_intersection(a.{{ column_name }}, b.{{ column_name }})) > {{ tolerance }}

)

select * from overlapping_pairs

{% endtest %}

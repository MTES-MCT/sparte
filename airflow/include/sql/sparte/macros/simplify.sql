{% macro simplify(source, geo_field, id_field, tolerance) %}
sELECT * FROM (
with poly as (
    select
        {{ id_field }} as id_field,
        (st_dump({{ geo_field }})).geom as geom
    from {{ source }}
),

rings as (
    select
        st_exteriorRing((st_dumpRings(geom)).geom) as geom
    from poly
),

merged as (
    select
        st_linemerge(st_union(geom)) as geom
    from rings
),

simplified as (
    select
        (st_dump(st_simplifyPreserveTopology(geom, {{ tolerance }}))).geom as geom
    from merged
),

polygonized as (
    select
        (st_dump(st_polygonize(distinct geom))).geom as geom
    from simplified
), last as (
select
    d.id_field,
    p.geom
from polygonized p
join poly d
    on st_intersects(d.geom, p.geom)
where st_area(st_intersection(d.geom, p.geom)) / st_area(p.geom) > 0.5
)
SELECT id_field, ST_Union(geom) as geom
FROM last
GROUP BY id_field
)

{% endmacro %}

{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["id"], "type": "btree"},
            {"columns": ["code"], "type": "btree"},
            {"columns": ["name"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["region"], "type": "btree"},
            {"columns": ["epci"], "type": "btree"},
            {"columns": ["scot"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["ST_Transform(geom, 4326)"], "type": "gist"},
        ],
    )
}}
with without_scots as (
select *, 32620 as srid_source
from {{ ref("commune_guadeloupe") }}
union all
select *, 32620 as srid_source
from {{ ref("commune_martinique") }}
union all
select *, 2972 as srid_source
from {{ ref("commune_guyane") }}
union all
select *, 2975 as srid_source
from {{ ref("commune_reunion") }}
union all
select *, 2154 as srid_source
from {{ ref("commune_metropole") }}
)
SELECT
    without_scots.*,
    scot_communes.id_scot as scot
FROM
    without_scots
LEFT JOIN
    {{ ref('scot_communes') }}
ON
    without_scots.code = scot_communes.commune_code

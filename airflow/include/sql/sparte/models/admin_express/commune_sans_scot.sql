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
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["geom_4326"], "type": "gist"},
        ],
    )
}}

-- Communes (admin express) SANS la colonne `scot`, donc sans dépendance au
-- mapping commune -> SCoT. Sert de base à `commune` (qui ajoute le scot) ainsi qu'au
-- rattachement géographique (scot_communes) et à scot_geom. Cela évite la dépendance
-- circulaire commune <-> scot_communes.

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
union all
select *, 4471 as srid_source
from {{ ref("commune_mayotte") }}

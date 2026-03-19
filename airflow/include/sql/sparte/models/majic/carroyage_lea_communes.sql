{{
    config(
        materialized='table',
    )
}}

{%- set years = range(2011, 2024) -%}
{%- set destinations = [
    ('total', ''),
    ('habitat', '_habitat'),
    ('activite', '_activite'),
    ('mixte', '_mixte'),
    ('route', '_route'),
    ('ferroviaire', '_ferroviaire'),
    ('inconnu', '_inconnu'),
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for dest_name, dest_suffix in destinations -%}
{%- do columns.append('carroyage.conso_' ~ year ~ dest_suffix) -%}
{%- endfor -%}
{%- endfor -%}

SELECT
    carroyage.idcarreau,
    commune.code as commune_code,
    commune.epci as epci_code,
    commune.departement as departement_code,
    commune.region as region_code,
    commune.scot as scot_code,
    {{ columns | join(',\n    ') }},
    carroyage.geom
FROM
    {{ ref('carroyage_lea') }} as carroyage
INNER JOIN
    {{ ref('commune') }} as commune
    ON st_intersects(commune.geom_4326, st_transform(carroyage.geom, 4326))
WHERE
    carroyage.geom IS NOT NULL

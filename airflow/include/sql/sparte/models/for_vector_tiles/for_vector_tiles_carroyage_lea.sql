{{
    config(
        materialized="table",
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

SELECT
    cc.idcarreau,
    {% for year in years %}
    {% for dest_name, dest_suffix in destinations %}
    MAX(cc.conso_{{ year }}{{ dest_suffix }}) as conso_{{ year }}{{ dest_suffix }},
    {% endfor %}
    {% endfor %}
    -- Géométrie (transformée de EPSG:3035 vers EPSG:4326)
    st_transform(cc.geom, 4326) as geom,
    -- Territoires
    array_agg(DISTINCT cc.commune_code) as "{{ var('COMMUNE') }}",
    array_agg(DISTINCT cc.epci_code) FILTER (WHERE cc.epci_code IS NOT NULL) as "{{ var('EPCI') }}",
    array_agg(DISTINCT cc.departement_code) FILTER (WHERE cc.departement_code IS NOT NULL) as "{{ var('DEPARTEMENT') }}",
    array_agg(DISTINCT cc.region_code) FILTER (WHERE cc.region_code IS NOT NULL) as "{{ var('REGION') }}",
    array_agg(DISTINCT cc.scot_code) FILTER (WHERE cc.scot_code IS NOT NULL) as "{{ var('SCOT') }}",
    array_agg(DISTINCT ccl.custom_land_id) FILTER (WHERE ccl.custom_land_id IS NOT NULL) as "{{ var('CUSTOM') }}"
FROM
    {{ ref('carroyage_lea_communes') }} as cc
LEFT JOIN
    {{ ref('commune_custom_land') }} as ccl
    ON ccl.commune_code = cc.commune_code
GROUP BY
    cc.idcarreau, cc.geom

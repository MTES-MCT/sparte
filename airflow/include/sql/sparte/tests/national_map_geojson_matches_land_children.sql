/*
    Chaque fond de la carte nationale contient exactement les territoires attendus d'après
    `land` : toutes les régions, tous les départements et tous les EPCI pour la France
    entière ; sous une région, un département ou un EPCI, les territoires plus fins qui le
    citent dans parent_keys. Détecte un territoire perdu faute de géométrie, un fond
    manquant et un fond inattendu.
*/

{% set nation = "'" ~ var("NATION") ~ "'" %}
{% set parent_types %}'{{ var("REGION") }}', '{{ var("DEPARTEMENT") }}', '{{ var("EPCI") }}'{% endset %}
{% set land_table = ref('land') %}

WITH expected AS (
    SELECT
        {{ nation }} AS land_id,
        {{ nation }} AS land_type,
        land_type AS child_land_type,
        count(*) AS expected_features
    FROM {{ land_table }}
    WHERE land_type IN ({{ parent_types }})
    GROUP BY land_type

    UNION ALL
    SELECT
        split_part(parent_key, '_', 2) AS land_id,
        split_part(parent_key, '_', 1) AS land_type,
        child.land_type AS child_land_type,
        count(DISTINCT child.land_id) AS expected_features
    FROM {{ land_table }} AS child
    CROSS JOIN unnest(child.parent_keys) AS parent_key
    WHERE child.land_type IN ('{{ var("DEPARTEMENT") }}', '{{ var("EPCI") }}', '{{ var("COMMUNE") }}')
        AND split_part(parent_key, '_', 1) IN ({{ parent_types }})
    GROUP BY 1, 2, 3
),

actual AS (
    SELECT
        land_id,
        land_type,
        child_land_type,
        jsonb_array_length(geojson -> 'features') AS actual_features
    FROM {{ ref('for_app_national_map_geojson') }}
)

SELECT
    land_id,
    land_type,
    child_land_type,
    expected.expected_features,
    actual.actual_features
FROM expected
FULL OUTER JOIN actual USING (land_id, land_type, child_land_type)
WHERE expected.expected_features IS DISTINCT FROM actual.actual_features

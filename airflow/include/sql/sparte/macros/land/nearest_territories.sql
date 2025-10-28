{% macro nearest_territories(land_type_var) %}
/*
    Macro pour calculer les 8 territoires les plus proches pour un type de territoire donné.

    Paramètres:
    - land_type_var: Variable DBT du type de territoire (ex: 'COMMUNE', 'EPCI')

    Le calcul se base uniquement sur la distance géographique entre les centroïdes des territoires.
    On s'assure que les territoires comparés ont le même SRID (métropole vs DROM-COM).
*/

WITH territory_centroids AS (
    -- Récupérer les centroïdes et SRID de chaque territoire depuis la table land
    SELECT
        land_id,
        land_type,
        name,
        ST_Centroid(geom) as centroid,
        ST_SRID(geom) as srid
    FROM {{ ref('land') }}
    WHERE geom IS NOT NULL
        AND land_type = '{{ var(land_type_var) }}'
),

base_pairs AS (
    -- Calculer les paires de territoires avec leur distance
    -- IMPORTANT: On ne compare que des territoires avec le même SRID (métropole vs DROM-COM)
    SELECT
        t1.land_id as land_id_1,
        t1.land_type,
        t1.name as land_name_1,
        t2.land_id as land_id_2,
        t2.name as land_name_2,
        ST_Distance(t1.centroid, t2.centroid) / 1000 as distance_km
    FROM
        territory_centroids t1
    INNER JOIN
        territory_centroids t2
        ON t1.srid = t2.srid  -- Même système de projection (évite les erreurs SRID)
        AND t1.land_id < t2.land_id  -- Éviter les doublons (A->B et B->A) et auto-référence
),

bidirectional_pairs AS (
    -- Créer les relations bidirectionnelles (A->B et B->A) en une seule passe
    SELECT
        land_id_1 as land_id,
        land_type,
        land_name_1 as land_name,
        land_id_2 as nearest_land_id,
        land_name_2 as nearest_land_name,
        distance_km
    FROM base_pairs

    UNION ALL

    SELECT
        land_id_2 as land_id,
        land_type,
        land_name_2 as land_name,
        land_id_1 as nearest_land_id,
        land_name_1 as nearest_land_name,
        distance_km
    FROM base_pairs
),

ranked_nearest AS (
    -- Calculer le rang basé sur la distance uniquement
    SELECT
        land_id,
        land_type,
        land_name,
        nearest_land_id,
        nearest_land_name,
        distance_km,
        ROW_NUMBER() OVER (
            PARTITION BY land_id, land_type
            ORDER BY distance_km ASC
        ) as distance_rank
    FROM bidirectional_pairs
)

SELECT
    land_id,
    land_name,
    land_type,
    nearest_land_id,
    nearest_land_name,
    distance_km,
    distance_rank
FROM ranked_nearest
WHERE distance_rank <= 8

{% endmacro %}

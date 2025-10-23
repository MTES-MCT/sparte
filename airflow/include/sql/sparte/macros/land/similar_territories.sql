{% macro similar_territories(land_type_var, flux_table_name, id_column) %}
/*
    Macro pour calculer les territoires similaires pour un type de territoire donné.

    Paramètres:
    - land_type_var: Variable DBT du type de territoire (ex: 'COMMUNE', 'EPCI')
    - flux_table_name: Nom de la table de flux de population (ex: 'flux_population_commune')
    - id_column: Nom de la colonne identifiant (ex: 'code_commune', 'epci')
*/

WITH latest_population AS (
    -- Récupérer la population la plus récente pour ce type de territoire
    SELECT DISTINCT ON ({{ id_column }})
        {{ id_column }} as land_id,
        '{{ var(land_type_var) }}' as land_type,
        population
    FROM {{ ref(flux_table_name) }}
    WHERE population IS NOT NULL AND population > 0
    ORDER BY {{ id_column }}, year DESC
),

territory_centroids AS (
    -- Récupérer les centroïdes, SRID et département de chaque territoire depuis la table land
    SELECT
        land_id,
        land_type,
        ST_Centroid(geom) as centroid,
        ST_SRID(geom) as srid,
        departements[1] as departement  -- Pour les communes, extraire le département du array
    FROM {{ ref('land') }}
    WHERE geom IS NOT NULL
        AND land_type = '{{ var(land_type_var) }}'
),

population_with_location AS (
    -- Joindre population, centroïde, SRID et département
    SELECT
        lp.land_id,
        lp.land_type,
        lp.population,
        tc.centroid,
        tc.srid,
        tc.departement
    FROM latest_population lp
    LEFT JOIN territory_centroids tc
        ON lp.land_id = tc.land_id
        AND lp.land_type = tc.land_type  -- IMPORTANT: filtrer aussi sur le type
    WHERE tc.centroid IS NOT NULL
),

base_pairs AS (
    -- Calculer les paires de territoires similaires avec population et distance
    -- IMPORTANT: On ne compare que des territoires avec le même SRID (métropole vs DROM-COM)
    -- Pour les communes < 100K habitants, on limite au même département
    SELECT
        t1.land_id as land_id_1,
        t1.land_type,
        t1.population as population_1,
        t2.land_id as land_id_2,
        t2.population as population_2,
        ABS(t1.population - t2.population) as population_difference,
        ST_Distance(t1.centroid, t2.centroid) / 1000 as distance_km
    FROM
        population_with_location t1
    INNER JOIN
        population_with_location t2
        ON t1.srid = t2.srid  -- Même système de projection (évite les erreurs SRID)
        AND t1.land_id < t2.land_id  -- Éviter les doublons (A->B et B->A) et auto-référence
        AND ABS(t1.population - t2.population) < t1.population * 2  -- Filtre heuristique : max 2x la population
        AND (  -- Filtrage par département pour les petites communes
            '{{ var(land_type_var) }}' != '{{ var("COMMUNE") }}'  -- Pas une commune, pas de restriction
            OR t1.population >= 100000  -- Commune >= 100K, recherche nationale
            OR t2.population >= 100000  -- L'autre commune >= 100K, recherche nationale
            OR t1.departement = t2.departement  -- Communes < 100K, même département obligatoire
        )
),

bidirectional_pairs AS (
    -- Créer les relations bidirectionnelles (A->B et B->A) en une seule passe
    SELECT
        land_id_1 as land_id,
        land_type,
        population_1 as population_source,
        land_id_2 as similar_land_id,
        population_2 as population_similar,
        population_difference,
        distance_km
    FROM base_pairs

    UNION ALL

    SELECT
        land_id_2 as land_id,
        land_type,
        population_2 as population_source,
        land_id_1 as similar_land_id,
        population_1 as population_similar,
        population_difference,
        distance_km
    FROM base_pairs
),

ranked_similarities AS (
    -- Calculer le rang de similarité basé sur population ET distance
    SELECT
        land_id,
        land_type,
        similar_land_id,
        population_source,
        population_similar,
        population_difference,
        distance_km,
        ROW_NUMBER() OVER (
            PARTITION BY land_id, land_type
            -- On trie d'abord par différence de population, puis par distance en cas d'égalité
            ORDER BY population_difference ASC, distance_km ASC
        ) as similarity_rank
    FROM bidirectional_pairs
)

SELECT
    rs.land_id,
    land_source.name as land_name,
    rs.land_type,
    rs.similar_land_id,
    land_similar.name as similar_land_name,
    rs.population_source,
    rs.population_similar,
    rs.population_difference,
    rs.distance_km,
    rs.similarity_rank
FROM ranked_similarities rs
LEFT JOIN {{ ref('land') }} land_source
    ON rs.land_id = land_source.land_id
    AND rs.land_type = land_source.land_type
LEFT JOIN {{ ref('land') }} land_similar
    ON rs.similar_land_id = land_similar.land_id
    AND rs.land_type = land_similar.land_type
WHERE rs.similarity_rank <= 8

{% endmacro %}

/*
    Test: Vérifier que chaque territoire a au maximum 8 territoires similaires
*/

with territory_counts as (
    SELECT
        land_id,
        land_type,
        COUNT(*) as similar_count
    FROM
        {{ ref('for_app_similar_territories') }}
    GROUP BY
        land_id,
        land_type
)

-- Retourne les territoires qui ont plus de 8 territoires similaires
select * from territory_counts where similar_count > 8

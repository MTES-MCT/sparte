/*
    Test: Vérifier que les territoires similaires sont bien du même type
    (commune avec commune, EPCI avec EPCI, etc.)

    Ce test vérifie que pour chaque territoire similaire, le land_type
    correspond bien au type du territoire source.
*/

SELECT
    st.land_id,
    st.land_type,
    st.similar_land_id,
    similar_pop.land_type as similar_land_type
FROM
    {{ ref('for_app_similar_territories') }} st
LEFT JOIN
    {{ ref('for_app_landpop') }} similar_pop
    ON st.similar_land_id = similar_pop.land_id
    AND st.land_type = similar_pop.land_type  -- IMPORTANT: filtrer aussi sur le type
WHERE
    similar_pop.land_id IS NULL  -- Le territoire similaire n'existe pas dans landpop avec le bon type

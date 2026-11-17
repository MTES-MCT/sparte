/*
    Les taux de la table compacte de la carte nationale sont exactement ceux de
    for_app_bivariate_land_rate : chaque ligne source des indicateurs et des mailles de la
    carte se retrouve, avec les mêmes valeurs, dans les colonnes correspondantes.

    Détecte une ligne perdue, une valeur différente, et deux lignes source d'un même
    territoire et d'une même période que le pivot aurait fondues alors qu'elles diffèrent.
*/

{% set land_types = [var("REGION"), var("DEPARTEMENT"), var("EPCI"), var("COMMUNE")] %}

SELECT
    source.land_type,
    source.start_year,
    source.end_year,
    source.land_id,
    source.indicator
FROM {{ ref('for_app_bivariate_land_rate') }} AS source
LEFT JOIN {{ ref('for_app_national_map_bivariate_rate') }} AS compact
    ON
        source.land_type = compact.land_type
        AND source.start_year = compact.start_year
        AND source.end_year = compact.end_year
        AND source.land_id = compact.land_id
WHERE
    source.indicator IN ('emploi', 'menages', 'population')
    AND source.land_type IN ('{{ land_types | join("', '") }}')
    AND (
        compact.land_id IS NULL
        OR source.conso_rate IS DISTINCT FROM CASE source.conso_field
            WHEN 'activite' THEN compact.conso_rate_activite
            WHEN 'habitat' THEN compact.conso_rate_habitat
            -- La consommation totale (lignes « population ») n'est pas reprise : rien à comparer
            ELSE source.conso_rate
        END
        OR source.indic_rate IS DISTINCT FROM CASE source.indicator
            WHEN 'emploi' THEN compact.indic_rate_emploi
            WHEN 'menages' THEN compact.indic_rate_menages
            WHEN 'population' THEN compact.indic_rate_population
        END
    )

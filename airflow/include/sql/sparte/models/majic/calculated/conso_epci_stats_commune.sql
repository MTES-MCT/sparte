{{ config(materialized='table') }}

SELECT
    commune.epci,
    conso.from_year,
    conso.to_year,
    percentile_disc(0.5) WITHIN GROUP (ORDER BY (
        CASE
            WHEN pop.evolution = 0
            THEN 0
            ELSE conso.total / pop.evolution
        END
    )) as median_ratio_pop_conso
FROM
    {{ ref('period_consommation_commune') }} as conso
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.code = conso.commune_code
LEFT JOIN
    {{ ref('period_flux_population_commune')}} as pop
    ON conso.commune_code = pop.code_commune
    AND conso.from_year = pop.from_year
    AND conso.to_year = pop.to_year
GROUP BY
    commune.epci,
    conso.from_year,
    conso.to_year

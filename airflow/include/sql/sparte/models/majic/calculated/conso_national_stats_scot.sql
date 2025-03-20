{{ config(materialized='table') }}

SELECT
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
    {{ ref('period_consommation_scot') }} as conso
LEFT JOIN
    {{ ref('scot') }} as scot
    ON scot.id_scot = conso.scot
LEFT JOIN
    {{ ref('period_flux_population_scot')}} as pop
    ON conso.scot = pop.scot
    AND conso.from_year = pop.from_year
    AND conso.to_year = pop.to_year
GROUP BY
    conso.from_year,
    conso.to_year

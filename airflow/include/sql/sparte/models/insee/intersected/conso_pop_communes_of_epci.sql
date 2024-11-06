{{ config(materialized='view') }}


-- WIP
with by_epci as (
    SELECT
        array_agg(conso.conso_2011_2021) as communes_consommation,

        commune.epci
    FROM
        {{ ref('consommation_cog_2024') }} as conso
    LEFT JOIN
        {{ ref('population')}} as pop
    ON
        pop.code_commune = conso.commune_code
    LEFT JOIN
        {{ ref('commune') }} as commune
    ON
        conso.commune_code = commune.code
    GROUP BY
        commune.epci
), by_epci_with_median as (
    SELECT
        epci,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY unnested_conso) as median,
        communes_consommation
    FROM
        by_epci
    CROSS JOIN LATERAL unnest(communes_consommation) as unnested_conso
    GROUP BY
        epci,
        communes_consommation
)
SELECT * FROM by_epci_with_median

-- PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY taux_de_consommation) AS median

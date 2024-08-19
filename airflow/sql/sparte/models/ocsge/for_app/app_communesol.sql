{{ config(materialized='table') }}

with ocsge_with_cs_us_id as (
    SELECT
        ocsge.commune_code,
        ocsge.code_us,
        ocsge.code_cs,
        ocsge.surface,
        ocsge.year,
        ocsge.departement,
        app_couverturesol.id as couverture_id,
        app_usagesol.id as usage_id
    FROM
        {{ ref('occupation_du_sol_commune')}} as ocsge
    LEFT JOIN
        {{ ref("app_couverturesol") }} AS app_couverturesol
    ON
        app_couverturesol.code_prefix = ocsge.code_cs
    LEFT JOIN
        {{ ref("app_usagesol") }} AS app_usagesol
    ON
        app_usagesol.code_prefix = ocsge.code_us
), ocsge_with_matrix as (
    SELECT
        ocsge_with_cs_us_id.commune_code,
        ocsge_with_cs_us_id.surface,
        ocsge_with_cs_us_id.year,
        ocsge_with_cs_us_id.departement,
        cs_us_matrix.id as matrix_id
    FROM
        ocsge_with_cs_us_id
    LEFT JOIN
        {{ ref("app_couvertureusagematrix") }} AS cs_us_matrix
    ON
        cs_us_matrix.couverture_id = ocsge_with_cs_us_id.couverture_id
    AND
        cs_us_matrix.usage_id = ocsge_with_cs_us_id.usage_id
), ocsge_with_matrix_and_city_id as (
    SELECT
        ocsge_with_matrix.commune_code,
        ocsge_with_matrix.surface,
        ocsge_with_matrix.year,
        ocsge_with_matrix.departement,
        ocsge_with_matrix.matrix_id,
        commune.id as city_id
    FROM
        ocsge_with_matrix
    LEFT JOIN
        {{ ref("app_commune") }} AS commune
    ON
        commune.insee = ocsge_with_matrix.commune_code
)

SELECT
    year,
   (sum(surface) / 10000) as surface,
    city_id,
    matrix_id
FROM
    ocsge_with_matrix_and_city_id
GROUP BY
    year,
    city_id,
    matrix_id

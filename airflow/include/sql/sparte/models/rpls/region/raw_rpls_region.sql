{{ config(materialized='table') }}

SELECT
    "LIBREG"::text                      as region_name,
    LPAD("REG"::text, 2, '0')           as region_code,
	{{ coalesce_rpls() }}
FROM
    {{ source('public', 'rpls_rpls_region') }}
WHERE "LIBREG" NOT IN
(
    'Total DROM',
    'Total France métropolitaine',
    'Total France entière',
    'Total France métropolitaine (hors IDF)',
    'Total France entière (hors IDF)',
    'Mayotte'
)

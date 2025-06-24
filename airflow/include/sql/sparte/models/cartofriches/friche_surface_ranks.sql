{{ config(materialized='table') }}

with percentiles as (
    select
        '25th' as percentile,
        percentile_disc(0.25) within group (order by surface) as value
    from {{ ref('friche') }}
    union
    select
        '50th' as percentile, percentile_disc(0.5) within group (order by surface) as value
    from {{ ref('friche') }}
    union
    select
        '75th' as percentile, percentile_disc(0.75) within group (order by surface) as value
    from {{ ref('friche') }}
    order by percentile
)
SELECT
    1 as rank,
    0 as min_surface,
    (select value from percentiles where percentile = '25th') as max_surface
UNION
SELECT
    2 as rank,
    (select value from percentiles where percentile = '25th') as min_surface,
    (select value from percentiles where percentile = '50th') as max_surface
UNION
SELECT
    3 as rank,
    (select value from percentiles where percentile = '50th') as min_surface,
    (select value from percentiles where percentile = '75th') as max_surface
UNION
SELECT
    4 as rank,
    (select value from percentiles where percentile = '75th') as min_surface,
    (select max(surface) from {{ ref('friche') }}) as max_surface
ORDER BY rank

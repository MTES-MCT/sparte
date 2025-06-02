{{ config(materialized='table') }}
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

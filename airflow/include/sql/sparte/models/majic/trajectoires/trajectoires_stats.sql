

with counts as (
    select
        count(*) as count,
        count(*) filter (where currently_respecting_regulation) as respecting_regulation_count,
        count(*) filter (where respecting_regulation_by_2030) as respecting_regulation_by_2030_count
    FROM {{ ref('land_trajectoires') }}
)

select
    count,
    respecting_regulation_count,
    respecting_regulation_by_2030_count,
    respecting_regulation_count * 100.0 / count as respecting_regulation_percent,
    respecting_regulation_by_2030_count * 100.0 / count as respecting_regulation_by_2030_percent
from
    counts

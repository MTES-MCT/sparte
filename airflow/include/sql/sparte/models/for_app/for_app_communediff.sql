{{ config(materialized="table", docs={"node_color": "purple"}) }}

select
    diff.year_old,
    diff.year_new,
    diff.new_artif,
    diff.new_natural,
    commune.code as city_id,
    diff.new_artif - diff.new_natural as net_artif
from
    (
        select
            year_old,
            year_new,
            sum(case when new_is_artificial then surface else 0 end)
            / 10000 as new_artif,
            sum(case when new_not_artificial then surface else 0 end)
            / 10000 as new_natural,
            commune_code
        from {{ ref("difference_commune") }}
        group by commune_code, year_old, year_new
    ) as diff
left join {{ ref("commune") }} as commune on commune.code = diff.commune_code

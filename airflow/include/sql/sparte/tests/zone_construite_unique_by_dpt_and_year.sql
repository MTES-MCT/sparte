with zone_construite as (
    SELECT
        geom,
        departement,
        year,
        row_number() over (partition by
            geom,
            departement,
            year
        ) as rn
    FROM
        {{ ref('zone_construite')}}
)
select * from zone_construite where rn != 1

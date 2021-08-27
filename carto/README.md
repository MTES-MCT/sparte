GEOJson example:
```
{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}
```


Calcule des palliers percentiles sur la population de l'exemple Wolrd Borders:
```
select percentile, min(pop2005), max(pop2005)
from
(
    select pop2005,
           case
                when sum(pop2005) over (order by pop2005) > 0.9 * sum(pop2005) over () then '100%'
                when sum(pop2005) over (order by pop2005) > 0.8 * sum(pop2005) over () then '090%'
                when sum(pop2005) over (order by pop2005) > 0.7 * sum(pop2005) over () then '080%'
                when sum(pop2005) over (order by pop2005) > 0.6 * sum(pop2005) over () then '070%'
                when sum(pop2005) over (order by pop2005) > 0.5 * sum(pop2005) over () then '060%'
                when sum(pop2005) over (order by pop2005) > 0.4 * sum(pop2005) over () then '050%'
                when sum(pop2005) over (order by pop2005) > 0.3 * sum(pop2005) over () then '040%'
                when sum(pop2005) over (order by pop2005) > 0.2 * sum(pop2005) over () then '030%'
                when sum(pop2005) over (order by pop2005) > 0.1 * sum(pop2005) over () then '020%'
                else '010%'
            end as percentile
    from carto_worldborder
) as t
group by percentile
order by percentile asc;
```

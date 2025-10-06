SELECT
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    difference_commune.departement,
    new_is_impermeable,
    new_not_impermeable,
    cs_new,
    cs_old,
    us_new,
    us_old,
    difference_commune.srid_source,
    st_transform(difference_commune.geom, 4326) as geom,
    difference_commune.surface,
    commune_code as "{{ var('COMMUNE')}}",
    commune.epci as "{{ var('EPCI')}}",
    commune.departement as "{{ var('DEPARTEMENT')}}",
    commune.region as "{{ var('REGION')}}",
    commune.scot as "{{ var('SCOT')}}"
FROM
    {{ ref("difference_commune")}}
 LEFT JOIN LATERAL (
    SELECT *
    FROM
        {{ ref('commune') }} as commune
    WHERE
        commune.code = difference_commune.commune_code
) commune ON TRUE

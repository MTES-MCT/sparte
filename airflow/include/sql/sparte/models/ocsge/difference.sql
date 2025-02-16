{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["loaded_date"], "type": "btree"},
            {"columns": ["year_old"], "type": "btree"},
            {"columns": ["year_new"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["uuid"], "type": "btree"},
            {"columns": ["cs_old"], "type": "btree"},
            {"columns": ["cs_new"], "type": "btree"},
            {"columns": ["us_old"], "type": "btree"},
            {"columns": ["us_new"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["srid_source"], "type": "btree"},
        ],
    )
}}

select
    foo.year_old,
    foo.year_new,
    foo.cs_new,
    foo.cs_old,
    foo.us_new,
    foo.us_old,
    foo.departement,
    foo.uuid,
    foo.geom,
    foo.srid_source as srid_source,
    to_timestamp(foo.loaded_date) as loaded_date,
    st_area(foo.geom) as surface,
    coalesce(
        foo.old_is_imper = false and foo.new_is_imper = true, false
    ) as new_is_impermeable,
    coalesce(
        foo.old_is_imper = true and foo.new_is_imper = false, false
    ) as new_not_impermeable,
    coalesce(
        foo.old_is_artif = false and foo.new_is_artif = true, false
    ) as new_is_artificial,
    coalesce(
        foo.old_is_artif = true and foo.new_is_artif = false, false
    ) as new_not_artificial
from
    (
        select
            ocsge.loaded_date,
            ocsge.year_old,
            ocsge.year_new,
            ocsge.cs_new,
            ocsge.cs_old,
            ocsge.us_new,
            ocsge.us_old,
            ocsge.departement,
            (
                st_dump(
                    st_intersection(departement_table.geom, st_makevalid(
                        ST_SetSRID(ocsge.geom, departement_table.srid_source)
                    ))
                )
            ).geom as geom,
            {{ is_artificial("cs_old", "us_old") }} as old_is_artif,
            {{ is_impermeable("cs_old") }} as old_is_imper,
            {{ is_artificial("cs_new", "us_new") }} as new_is_artif,
            {{ is_impermeable("cs_new") }} as new_is_imper,
            ocsge.uuid::uuid,
            departement_table.srid_source as srid_source
        from {{ source("public", "ocsge_difference") }} as ocsge
        left join
            {{ ref("departement") }} as departement_table
            on departement = departement_table.code
        where
            ocsge.cs_new is not null
            and ocsge.cs_old is not null
            and ocsge.us_new is not null
            and ocsge.us_old is not null
    ) as foo

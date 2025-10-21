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
    foo.year_old_index,
    foo.year_new_index,
    artif = 1 as new_is_artificial,
    artif = -1 as new_not_artificial,
    foo.cs_new,
    foo.cs_old,
    foo.us_new,
    foo.us_old,
    foo.departement,
    foo.uuid,
    foo.geom,
    foo.srid_source as srid_source,
    to_timestamp(foo.loaded_date) as loaded_date,
    st_area(foo.geom) as surface
from
    (
        select
            ocsge.loaded_date,
            ocsge.year_old,
            ocsge.year_new,
            year_new_millesimes.index as year_new_index,
            year_old_millesimes.index as year_old_index,
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
            ocsge.artif_new,
            ocsge.artif_old,
            ocsge.artif,
            ocsge.uuid::uuid,
            departement_table.srid_source as srid_source
        from {{ source("public", "ocsge_artif_difference") }} as ocsge
        left join
            {{ ref("departement") }} as departement_table
            on departement = departement_table.code
        left join lateral (
            SELECT index FROM {{ ref("millesimes") }}
            WHERE
                ocsge.year_old = millesimes.year
                and ocsge.departement = millesimes.departement

        ) as year_old_millesimes on true
        left join lateral (
            SELECT index FROM {{ ref("millesimes") }}
            WHERE
                ocsge.year_new = millesimes.year
                and ocsge.departement = millesimes.departement

        ) as year_new_millesimes on true
                    where
            ocsge.cs_new is not null
            and ocsge.cs_old is not null
            and ocsge.us_new is not null
            and ocsge.us_old is not null

    ) as foo

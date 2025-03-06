{{
    config(
        materialized="incremental",
        indexes=[
            {"columns": ["id"], "type": "btree"},
            {"columns": ["loaded_date"], "type": "btree"},
            {"columns": ["raw_loaded_date"], "type": "btree"},
            {"columns": ["departement", "year"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["uuid"], "type": "btree"},
            {"columns": ["code_cs"], "type": "btree"},
            {"columns": ["code_us"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["srid_source"], "type": "btree"},
        ],
        pre_hook=[
            "{{ create_idx_if_not_exists('ocsge_occupation_du_sol', ['id']) }}",
            "{{ create_idx_if_not_exists('ocsge_occupation_du_sol', ['year']) }}",
            "{{ create_idx_if_not_exists('ocsge_occupation_du_sol', ['departement']) }}",
            "{{ create_idx_if_not_exists('ocsge_occupation_du_sol', ['loaded_date']) }}",
        ],
        post_hook=[
            "DELETE FROM {{ this }} WHERE raw_loaded_date not in (SELECT distinct loaded_date FROM {{ source('public', 'ocsge_occupation_du_sol') }})"
        ]
    )
}}

/*

Les données d'occupation du sol étant mal découpé par département, on les recoupe
avec les géométries des départements issues d'admin Express.

L'utilisation conjointe de st_intersection et st_dump permet d'éviter qu'une partie
des données d'occupation du sol ne soient perdues lors du découpage : ST_Intersection
est en effet succeptible de générer des geometrycollection, même si le type des géométries
en entrée est homogène.

*/
with
    without_surface as (
        select
            loaded_date as raw_loaded_date,
            to_timestamp(loaded_date) as loaded_date,
            occupation.id,
            code_cs,
            code_us,
            departement,
            year,
            {{ is_impermeable("code_cs") }} as is_impermeable,
            {{ is_artificial("code_cs", "code_us") }} as is_artificial,
            uuid::uuid,
            (
                st_dump(st_intersection(
                    departement_table.geom,
                    ST_SetSRID(
                        occupation.geom,
                        departement_table.srid_source
                    )
                )
            )
            ).geom as geom,
            departement_table.srid_source as srid_source
        from {{ source("public", "ocsge_occupation_du_sol") }} as occupation
        left join
            {{ ref("departement") }} as departement_table
            on departement = departement_table.code
        {% if is_incremental() %}
        where loaded_date > (select max(raw_loaded_date) from {{ this }} )
        {% endif %}
    )
select *, st_area(geom) as surface
from without_surface
where not st_isempty(geom)

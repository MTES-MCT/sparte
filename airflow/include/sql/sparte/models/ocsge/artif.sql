


{{
    config(
        materialized='incremental',
        indexes=[
            {'columns': ['id'], 'type': 'btree'},
            {'columns': ['code_cs'], 'type': 'btree'},
            {'columns': ['code_us'], 'type': 'btree'},
            {'columns': ['year'], 'type': 'btree'},
            {'columns': ['departement'], 'type': 'btree'},
            {"columns": ["departement", "year"], "type": "btree"},
            {'columns': ['geom'], 'type': 'gist'},
            {'columns': ['is_artificial'], 'type': 'btree'},
            {'columns': ['loaded_date'], 'type': 'btree'},
            {'columns': ['raw_loaded_date'], 'type': 'btree'},
        ],
        pre_hook=[
            "{{ create_idx_if_not_exists('ocsge_artif', ['id']) }}",
            "{{ create_idx_if_not_exists('ocsge_artif', ['year']) }}",
            "{{ create_idx_if_not_exists('ocsge_artif', ['departement']) }}",
            "{{ create_idx_if_not_exists('ocsge_artif', ['loaded_date']) }}",
        ],
        post_hook=[
            "DELETE FROM {{ this }} WHERE raw_loaded_date not in (SELECT distinct loaded_date FROM {{ source('public', 'ocsge_artif') }})"
        ]
    )
}}


with
    without_surface as (
        select
            occupation.id,
            loaded_date as raw_loaded_date,
            to_timestamp(loaded_date) as loaded_date,
            code_cs,
            code_us,
            departement,
            year,
            CASE
                WHEN artif = 'artif' THEN true
                WHEN artif = 'non artif' THEN false
                ELSE null
            END AS is_artificial,
            crit_seuil as critere_seuil,
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
        from {{ source("public", "ocsge_artif") }} as occupation
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

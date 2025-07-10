{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["libelle"], "type": "btree"},
            {"columns": ["type_zone"], "type": "btree"},
            {"columns": ["checksum"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["srid_source"], "type": "btree"},
        ],
        pre_hook=[
            'CREATE INDEX ON "public"."gpu_zone_urba" USING GIST (geom)',
            'CREATE INDEX ON "public"."gpu_zone_urba" USING GIST (ST_PointOnSurface(geom))',
        ],
    )
}}

with marked_duplicates as (
    select
        *,
        row_number() over (partition by ST_AsBinary(geom) ORDER BY gpu_timestamp DESC) as rn
    FROM {{ source("public", "gpu_zone_urba") }}
    WHERE ST_AsBinary(geom) IS NOT NULL
    OR NOT st_isempty(geom)
), wihtout_surface as (
        select
            gpu_doc_id,
            gpu_status,
            gpu_timestamp::timestamptz as gpu_timestamp,
            commune.departement as departement,
            partition,
            libelle,
            nullif(libelong, '') as libelle_long,
            {{ standardize_zonage_type("typezone") }} as type_zone,
            nullif(destdomi, '') as destination_dominante,
            nomfic as nom_fichier,
            nullif(urlfic, '') as url_fichier,
            commune.code as commune_code,
      /*

        Etant donné que 3 formats coexistent dans les données source,
        les dates ne sont pas castées au format date
        Les 3 formats sont :
        - YYYYMMDD
        - DDMMYYYY
        - YYYYDDMM

        */
        datappro as date_approbation,
        datvalid as date_validation,
            nullif(idurba, '') as id_document_urbanisme,
            st_geohash(zonage.geom) as checksum,
            {{
                make_valid_multipolygon(
                    "ST_transform(zonage.geom, commune.srid_source)"
                )
            }} as geom,
            commune.srid_source as srid_source
        from marked_duplicates as zonage
        left join
            {{ ref("commune") }} as commune
            on st_transform(commune.geom, 4326) && zonage.geom
            and st_contains(
                st_transform(commune.geom, 4326), st_pointonsurface(zonage.geom)
            )
        where
            not st_isempty(zonage.geom)
            and rn = 1
)
select
    wihtout_surface.*,
    round(st_area(wihtout_surface.geom)::numeric, 4) as surface
from
    wihtout_surface

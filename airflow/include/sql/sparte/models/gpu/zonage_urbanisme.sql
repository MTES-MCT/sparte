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
            'CREATE INDEX ON "public"."gpu_zone_urba" (checksum)',
            'CREATE INDEX ON "public"."gpu_zone_urba" (checksum, gpu_timestamp DESC)',
            'CREATE INDEX ON "public"."gpu_zone_urba" USING GIST (geom)',
            'CREATE INDEX ON "public"."gpu_zone_urba" USING GIST (ST_PointOnSurface(geom))',
        ],
    )
}}

/*

Afin de mieux pouvoir exploiter les données de zonage d'urbanisme
avec les données OCS Ge (qui sont livrées par département), nous avons besoin de
les enrichir avec le code du département dans lequel ils se trouvent.

*/
select foo.*, round(st_area(foo.geom)::numeric, 4) as surface
from
    (
        select distinct
            on (checksum)
            gpu_doc_id,
            gpu_status,
            gpu_timestamp::timestamptz as gpu_timestamp,
            commune.departement as departement,
            partition,
            libelle,
            nullif(libelong, '') as libelle_long,
            typezone as type_zone,
            nullif(destdomi, '') as destination_dominante,
            nomfic as nom_fichier,
            nullif(urlfic, '') as url_fichier,
            nullif(insee, '') as commune_code,
            to_date(nullif(datappro, ''), 'YYYYMMDD') as date_approbation,
            to_date(nullif(datvalid, ''), 'YYYYMMDD') as date_validation,
            nullif(idurba, '') as id_document_urbanisme,
            checksum,
            {{
                make_valid_multipolygon(
                    "ST_transform(zonage.geom, commune.srid_source)"
                )
            }} as geom,
            commune.srid_source as srid_source
        from {{ source("public", "gpu_zone_urba") }} as zonage
        left join
            {{ ref("commune") }} as commune
            on st_transform(commune.geom, 4326) && zonage.geom
            and st_contains(
                st_transform(commune.geom, 4326), st_pointonsurface(zonage.geom)
            )
        where
            {{ raw_date_starts_with_yyyy("datappro") }}
            and {{ raw_date_starts_with_yyyy("datvalid") }}
            and not st_isempty(zonage.geom)
        order by checksum, gpu_timestamp desc
    ) as foo
where not st_isempty(foo.geom)

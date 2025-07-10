{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["libelle"], "type": "btree"},
            {"columns": ["typezone"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

select
    gpu_doc_id,
    gpu_status,
    gpu_timestamp,
    partition,
    libelle,
    libelong,
    typezone,
    destdomi,
    nomfic,
    urlfic,
    datappro,
    datvalid,
    idurba,
    geom
FROM
    {{ source("public", "gpu_zone_urba") }}

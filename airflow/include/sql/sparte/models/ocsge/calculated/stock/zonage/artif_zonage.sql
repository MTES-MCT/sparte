{{
    config(
        materialized="table",
        indexes=[{"columns": ["zonage_checksum"], "type": "btree"}],
    )
}}
{{
    merge_ocsge_zonage(
        where_conditions=[
            "is_artificial",
        ]
    )
}}

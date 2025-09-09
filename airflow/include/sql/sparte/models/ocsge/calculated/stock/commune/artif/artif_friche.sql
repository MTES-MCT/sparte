{{
    config(
        materialized="table",
        indexes=[{"columns": ["site_id"], "type": "btree"}],
    )
}}

{{
    merge_ocsge_friche(
        where_conditions=[
            "is_artificial",
        ]
    )
}}

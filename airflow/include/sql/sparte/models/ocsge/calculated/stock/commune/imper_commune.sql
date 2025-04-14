{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

{{
    merge_ocsge_commune(
        where_conditions=[
            "is_impermeable",
        ]
    )
}}

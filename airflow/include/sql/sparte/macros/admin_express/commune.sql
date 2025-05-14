{% macro commune(source_table_name) %}
    {{ config(materialized="table") }}
    with simplified as (
        {{
            simplify(
                source=source('public', source_table_name),
                geo_field='geom',
                id_field='insee_com',
                tolerance='50'
            )
        }}
    ), epci_and_ept as (
            select
                insee_com as commune_code,
                case
                    when siren_epci = 'NR'
                    then array[]::varchar[]
                    when siren_epci = 'NC'
                    then array[]::varchar[]
                    when strpos(siren_epci, '/') > 0
                    then string_to_array(siren_epci, '/')::varchar[]
                    else array[siren_epci]::varchar[]
                end as epcis
            from {{ source("public", source_table_name) }}
        )

    select
        id,
        nom as name,
        nom_m as name_uppercase,
        insee_com as code,
        statut as type,
        population as population,
        insee_can as canton,
        insee_arr as arrondissement,
        insee_dep as departement,
        insee_reg as region,
        {{ get_ept_from_epci_array("epci_and_ept.epcis") }} as ept,
        {{ get_non_ept_from_epci_array("epci_and_ept.epcis") }} as epci,
        st_area(commune.geom) as surface,
        commune.geom,
        simplified.geom as simple_geom
    from {{ source("public", source_table_name) }} as commune
    left join epci_and_ept on commune.insee_com = epci_and_ept.commune_code
    left join simplified on commune.insee_com = simplified.id_field
{% endmacro %}

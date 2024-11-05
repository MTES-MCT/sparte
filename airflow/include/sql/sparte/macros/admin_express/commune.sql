
{% macro commune(source_table_name) %}
    {{ config(materialized='table') }}
    with epci_and_ept as (
        select
            insee_com as commune_code,
            CASE
                when siren_epci = 'NR' THEN ARRAY[]::VARCHAR[]
                when siren_epci = 'NC' THEN ARRAY[]::VARCHAR[]
                when strpos(siren_epci, '/') > 0 THEN string_to_array(siren_epci, '/')::VARCHAR[]
                ELSE ARRAY[siren_epci]::VARCHAR[]
            END as epcis
        from
            {{ source('public', source_table_name) }}
    )

    SELECT
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
        {{ get_ept_from_epci_array('epci_and_ept.epcis') }} as ept,
        {{ get_non_ept_from_epci_array('epci_and_ept.epcis') }} as epci,
        ST_Area(geom) as surface,
        geom
    FROM
        {{ source('public', source_table_name) }} as commune
    LEFT JOIN epci_and_ept ON commune.insee_com = epci_and_ept.commune_code
{% endmacro %}

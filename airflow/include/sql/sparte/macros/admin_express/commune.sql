{% macro commune(source_table_name) %}
    {{config(materialized="table") }}
    with simplified as (
        {{
            simplify(
                source=source('public', source_table_name),
                geo_field='geom',
                id_field='code_insee',
                tolerance='50'
            )
        }}
    ), epci_and_ept as (
            select
                code_insee as commune_code,
                case
                    when codes_siren_des_epci = 'NR'
                    then array[]::varchar[]
                    when codes_siren_des_epci = 'NC'
                    then array[]::varchar[]
                    when strpos(codes_siren_des_epci, '/') > 0
                    then string_to_array(codes_siren_des_epci, '/')::varchar[]
                    else array[codes_siren_des_epci]::varchar[]
                end as epcis
            from {{ source("public", source_table_name) }}
        )

    select
        cleabs as id,
        nom_officiel as name,
        nom_officiel_en_majuscules as name_uppercase,
        code_insee as code,
        statut as type,
        population as population,
        code_insee_de_l_arrondissement as arrondissement,
        code_insee_du_departement as departement,
        code_insee_de_la_region as region,
        {{ get_ept_from_epci_array("epci_and_ept.epcis") }} as ept,
        {{ get_non_ept_from_epci_array("epci_and_ept.epcis") }} as epci,
        st_area(commune.geom) as surface,
        commune.geom,
        simplified.geom as simple_geom,
        ST_Transform(commune.geom, 4326) as geom_4326
    from {{ source("public", source_table_name) }} as commune
    left join epci_and_ept on commune.code_insee = epci_and_ept.commune_code
    left join simplified on commune.code_insee = simplified.id_field
{% endmacro %}

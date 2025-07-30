{{ config(materialized="table") }}

SELECT
    land_id as commune,
    conso_2011_2020 as conso_2011_2020,
    {{ boolean_as_oui_non('allowed_conso_raised_to_1ha_2021_2030') }} as conso_autorisee_augmentee_a_1ha_2021_2030,
    allowed_conso_2021_2030 as conso_autorisee_2021_2030,
    conso_since_2021 as conso_depuis_2021,
    annual_conso_since_2021 as conso_annuelle_depuis_2021,
    projected_conso_2030 as conso_projetee_2030,
    {{ boolean_as_oui_non('currently_respecting_regulation') }} as respecte_reglementation_actuellement,
    current_percent_use as pourcentage_utilisation_actuelle,
    {{ boolean_as_oui_non('respecting_regulation_by_2030') }} as respectera_reglementation_en_2030,
    projected_percent_use_by_2030 as pourcentage_utilisation_projetee_en_2030
FROM
    {{ ref('land_trajectoires') }}
WHERE
    land_type = '{{ var('COMMUNE') }}'

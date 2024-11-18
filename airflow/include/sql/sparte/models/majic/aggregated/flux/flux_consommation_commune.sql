{{ config(materialized='table') }}

{% for year in range(2009, 2023) %}
    SELECT
        commune_code,
        correction_status,
        commune.surface as surface,
        {{ year }} as year,
        conso_{{ year }} as total,
        conso_{{ year }}_activite as activite,
        conso_{{ year }}_habitat as habitat,
        conso_{{ year }}_mixte as mixte,
        conso_{{ year }}_route as route,
        conso_{{ year }}_ferroviaire as ferroviaire,
        conso_{{ year }}_inconnu as inconnu
    FROM {{ ref('consommation_cog_2024') }} as conso
    LEFT JOIN {{ ref('commune') }} as commune
    ON commune.code = conso.commune_code
    {% if not loop.last %}
        UNION
    {% endif %}
{% endfor %}

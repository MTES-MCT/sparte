/*
    La surface enclose par la limite d'un parent reste proche de celle de ses communes
    couvertes par la maille (une commune sans EPCI n'est dans aucune entité du fond). Un
    écart plus grand signale une face d'entité à cheval rattachée au mauvais côté.

    Écart toléré : 5 %. Mesuré en lecture seule sur les 101 départements : 2,3 % au plus
    (Hauts-de-Seine, petits devant la tolérance de 1 000 m), moins de 1 % pour 98 d'entre eux.
*/

{% set max_relative_gap = 0.05 %}
{% set commune_column_by_parent_type = {
    var("DEPARTEMENT"): "departement",
} %}

WITH origins AS (
    {% for parent_type, commune_column in commune_column_by_parent_type.items() %}
    SELECT
        {{ commune_column }} AS land_id,
        '{{ parent_type }}' AS land_type,
        sum(ST_Area(simple_geom)) AS origin_surface
    FROM {{ ref('commune') }}
    WHERE epci IS NOT NULL
    GROUP BY {{ commune_column }}
    {% if not loop.last %}UNION ALL{% endif %}
    {% endfor %}
)

SELECT
    boundary.land_id,
    boundary.land_type,
    boundary.surface,
    origins.origin_surface
FROM {{ ref('land_national_map_parent_boundary_geom') }} AS boundary
JOIN origins USING (land_id, land_type)
WHERE abs(boundary.surface / origins.origin_surface - 1) > {{ max_relative_gap }}

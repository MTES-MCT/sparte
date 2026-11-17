/*
Ce test vérifie que les densités de consommation des carroyages par destination de la carte
nationale sont strictement positives, comme celles du carroyage total : une année sans
consommation vaut NULL (elle n'est alors pas écrite dans les tuiles), jamais zéro, et les
quelques valeurs négatives de la source sont ramenées à zéro avant le calcul (voir la macro
`carroyage_national_origin_conso`).

Le test retourne, avec leur destination, les carreaux et les blocs qui portent une densité
nulle ou négative.
*/

{%- set years = carroyage_national_years() -%}

{% for destination in carroyage_national_destinations() %}
SELECT
    '{{ destination }}' AS destination,
    idcarreau
FROM
    {{ ref('for_vector_tiles_carroyage_national_' ~ destination) }}
WHERE
    {% for year in years %}
    conso_{{ year }} <= 0{{ " OR" if not loop.last }}
    {% endfor %}
{{ "UNION ALL" if not loop.last }}
{% endfor %}

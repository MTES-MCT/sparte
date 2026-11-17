/*
Ce test vérifie que les densités de consommation du carroyage de la carte nationale sont
strictement positives : une année sans consommation vaut NULL (elle n'est alors pas écrite
dans les tuiles), jamais zéro, et une consommation ne peut pas être négative.

Le test retourne les carreaux et les blocs qui portent une densité nulle ou négative.
*/

{%- set years = carroyage_national_years() -%}

SELECT
    idcarreau
FROM
    {{ ref('for_vector_tiles_carroyage_national') }}
WHERE
    {% for year in years %}
    conso_{{ year }} <= 0{{ " OR" if not loop.last }}
    {% endfor %}

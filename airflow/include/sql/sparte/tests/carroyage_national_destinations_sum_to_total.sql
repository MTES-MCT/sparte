/*
Ce test vérifie que les six carroyages par destination de la carte nationale, additionnés,
redonnent le carroyage total : pour chaque carreau de 1 km, chaque bloc et chaque année, la
somme des densités des destinations doit égaler la densité totale. Une destination oubliée,
comptée deux fois ou lue dans une mauvaise colonne s'y voit.

L'égalité n'est pas exacte, pour deux raisons :
- les arrondis du modèle : sept densités arrondies à l'entier, soit 3,5 m² par km² au plus ;
- la source elle-même. Le Cerema livre la consommation totale et celle de chaque destination
  comme des valeurs indépendantes, dont la somme ne retombe pas toujours sur le total : au
  12 novembre 2026, sur 800 473 couples carreau × année consommés, 29 799 s'en écartent, dont
  2 507 de plus de 3 m², de -32 à +37 m². Un bloc moyenne les écarts de ses carreaux : sa
  densité ne s'écarte pas davantage.

La tolérance est donc de 100 m² par km² (0,01 ha par km²), soit un dixième de la première
borne des classes de la carte (0,1 ha) : assez large pour les écarts de la source, assez
serrée pour qu'une erreur de calcul, qui déplace des centaines de m², ne passe pas.

Un carreau ou un bloc du total absent de toutes les destinations compte pour une somme nulle.
Ceux d'une destination absents du total sont relevés par
`carroyage_national_destinations_blocks_are_in_total`.

Le test retourne les carreaux et les blocs du total dont la densité d'une année s'écarte de
la somme des destinations de plus que la tolérance.
*/

{%- set years = carroyage_national_years() -%}
{%- set tolerance_m2_par_km2 = 100 -%}

WITH destinations AS (
    {% for destination in carroyage_national_destinations() %}
    SELECT
        idcarreau,
        {% for year in years %}
        conso_{{ year }}{{ "," if not loop.last }}
        {% endfor %}
    FROM
        {{ ref('for_vector_tiles_carroyage_national_' ~ destination) }}
    {{ "UNION ALL" if not loop.last }}
    {% endfor %}
),

sommes AS (
    SELECT
        idcarreau,
        {% for year in years %}
        COALESCE(SUM(conso_{{ year }}), 0) AS conso_{{ year }}{{ "," if not loop.last }}
        {% endfor %}
    FROM
        destinations
    GROUP BY
        idcarreau
)

SELECT
    total.idcarreau
FROM
    {{ ref('for_vector_tiles_carroyage_national') }} AS total
LEFT JOIN
    sommes
    ON sommes.idcarreau = total.idcarreau
WHERE
    {% for year in years %}
    ABS(COALESCE(total.conso_{{ year }}, 0) - COALESCE(sommes.conso_{{ year }}, 0)) > {{ tolerance_m2_par_km2 }}{{ " OR" if not loop.last }}
    {% endfor %}

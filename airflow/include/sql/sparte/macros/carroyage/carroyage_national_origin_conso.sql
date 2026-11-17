{#-
    Colonne de la source (`for_vector_tiles_carroyage_lea`) qui donne la consommation d’une
    année, en m² par carreau de 1 km : la consommation totale (`destination` absent) ou celle
    d’une destination de `carroyage_national_destinations()`. Dans les deux cas la colonne
    obtenue s’appelle `conso_AAAA`.

    `relation` est l’alias de la source dans la requête, s’il faut le préciser.

    Une consommation négative par destination est ramenée à zéro : la source en contient
    quelques-unes (36 valeurs de -1 ou -2 m² sur 255 233 carreaux et 14 années au
    12 novembre 2026, toutes pour « inconnu »), restes d’arrondi et non des mesures. La
    consommation totale n’en contient aucune et n’est pas modifiée : une valeur négative y
    serait une anomalie, que le test `carroyage_national_densities_are_positive` doit voir.
-#}
{% macro carroyage_national_origin_conso(year, destination=none, relation=none) %}
    {%- set column = (relation ~ '.' if relation else '') ~ 'conso_' ~ year -%}
    {%- if destination is none -%}
        {{ column }}
    {%- elif destination in carroyage_national_destinations() -%}
        GREATEST({{ column }}_{{ destination }}, 0) AS conso_{{ year }}
    {%- else -%}
        {{ exceptions.raise_compiler_error("Destination inconnue : « " ~ destination ~ " », attendu l'une de " ~ carroyage_national_destinations()) }}
    {%- endif -%}
{% endmacro %}

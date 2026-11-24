{#-
    Coordonnée, en km, du coin sud-ouest d’un carreau ou d’un bloc du carroyage, lue dans son
    identifiant « <côté>kmN<nord>E<est> » (par exemple « 1kmN2030E4252 »). Ces coordonnées
    sont celles de la projection EPSG:3035 (ETRS89-LAEA), où la grille est carrée.

    `axis` vaut `N` (nord) ou `E` (est).

    Un découpage de chaîne plutôt qu’une expression régulière : il est vingt fois plus rapide
    sur les 255 000 carreaux, et un identifiant d’une autre forme fait échouer la conversion
    en entier, donc la requête, au lieu de donner une coordonnée fausse.
-#}
{% macro carroyage_national_id_coordinate_km(idcarreau, axis) %}
    {%- if axis == 'N' -%}
        split_part(split_part({{ idcarreau }}, 'kmN', 2), 'E', 1)::int
    {%- elif axis == 'E' -%}
        split_part({{ idcarreau }}, 'E', 2)::int
    {%- else -%}
        {{ exceptions.raise_compiler_error("Axe inconnu : « " ~ axis ~ " », attendu 'N' ou 'E'") }}
    {%- endif -%}
{% endmacro %}

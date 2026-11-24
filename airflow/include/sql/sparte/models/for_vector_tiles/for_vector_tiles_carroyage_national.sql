{{
    config(
        materialized="table",
    )
}}

{#-
    Carroyage allégé pour la carte nationale (France entière et Hexagone) : uniquement la
    consommation totale de chaque année, sans le détail par destination ni les territoires
    plus fins que la région.

    Le modèle empile plusieurs résolutions de la même grille, une par plage de zooms du
    fichier de tuiles (voir le DAG `create_carroyage_national_vector_tiles`) : à l’échelle du
    pays, un carreau de 1 km fait moins d’un pixel, et une vue France entière chargeait les
    255 000 carreaux (6 Mo de tuiles par zoom) pour ne dessiner qu’une texture. Les carreaux
    y sont donc regroupés en blocs carrés de 2 km puis 5 km de côté.

    Un aplat de couleur sur un carreau n’a de sens que pour une densité. Un bloc porte donc,
    sous les mêmes noms `conso_AAAA`, sa consommation ramenée à sa surface : des m² par km²,
    c’est-à-dire exactement ce que vaut un carreau de 1 km (m² consommés dans 1 km²). Les
    classes et la légende de la carte restent ainsi valables à toutes les résolutions.
    La surface d’un bloc est celle du bloc entier : les carreaux sans consommation, absents
    de la source, comptent dans le dénominateur (un bloc à cheval sur la mer ou la frontière
    est dilué d’autant, comme l’est déjà un carreau de 1 km côtier).

    Une année sans consommation vaut NULL : tippecanoe n’écrit pas les attributs nuls, ce qui
    allège encore les tuiles (le front les lit comme des zéros).

    La requête est celle de la macro `carroyage_national_blocs`, partagée avec les modèles par
    destination `for_vector_tiles_carroyage_national_<destination>`.
-#}

{{ carroyage_national_blocs() }}

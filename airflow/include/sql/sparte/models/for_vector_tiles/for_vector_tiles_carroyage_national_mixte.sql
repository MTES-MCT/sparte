{{
    config(
        materialized="table",
    )
}}

{#-
    Carroyage allégé pour la carte nationale, restreint à la consommation d'espaces pour
    les usages mixtes : mêmes colonnes et mêmes conventions que
    `for_vector_tiles_carroyage_national`, où ces choix sont expliqués.
-#}

{{ carroyage_national_blocs(destination='mixte') }}

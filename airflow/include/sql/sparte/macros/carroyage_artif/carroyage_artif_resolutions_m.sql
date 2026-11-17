{#-
    Résolutions du carroyage des sols artificialisés de la carte nationale : le côté, en
    mètres, des mailles carrées, de la plus fine à la plus grande. Une seule définition pour
    les modèles `artif_carroyage_commune` et `for_vector_tiles_sols_artificialises_national`
    et pour leurs tests.

    La première est la maille de calcul : les objets OCS GE ne sont découpés qu'une fois, à
    cette résolution. Les suivantes en sont des multiples entiers, pour que chaque bloc
    regroupe un nombre entier de mailles fines.

    Chaque résolution doit recevoir une plage de zooms dans le DAG
    `create_sols_artificialises_national_vector_tiles` (`ZOOMS_BY_RESOLUTION_M`) : un test
    pytest compare les deux listes.
-#}
{% macro carroyage_artif_resolutions_m() %}
    {{ return([250, 500, 1000, 2000, 5000]) }}
{% endmacro %}

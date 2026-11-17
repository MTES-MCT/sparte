{#-
    Plus grande résolution, en mètres, dont les mailles portent la liste de leurs EPCI.

    La carte ne filtre les mailles sur un EPCI que lorsqu'elle affiche un EPCI, à des zooms
    où les mailles font 500 m au plus. Au-delà, un bloc recoupe de nombreux EPCI et leur
    liste alourdirait les tuiles pour rien.
-#}
{% macro carroyage_artif_epci_max_resolution_m() %}
    {{ return(1000) }}
{% endmacro %}

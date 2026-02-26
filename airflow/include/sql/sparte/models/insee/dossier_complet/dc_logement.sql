{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Logement : parc, type, statut d'occupation, motorisation #}
{%- set years = ['22', '16', '11'] -%}
{%- set indicators = [
    ('LOG', 'logements'),
    ('RP', 'residences_principales'),
    ('RSECOCC', 'residences_secondaires'),
    ('LOGVAC', 'logements_vacants'),
    ('MAISON', 'maisons'),
    ('APPART', 'appartements'),
    ('RP_PROP', 'rp_proprietaires'),
    ('RP_LOC', 'rp_locataires'),
    ('RP_LOCHLMV', 'rp_locataires_hlm'),
    ('RP_GRAT', 'rp_loges_gratuit'),
    ('RPMAISON', 'rp_maisons'),
    ('RPAPPART', 'rp_appartements'),
    ('NBPI_RP', 'nb_pieces_rp'),
    ('RP_VOIT1P', 'rp_1_voiture_plus'),
    ('RP_VOIT1', 'rp_1_voiture'),
    ('RP_VOIT2P', 'rp_2_voitures_plus'),
    ('RP_GARL', 'rp_garage'),
    ('RP_ELEC', 'rp_electricite'),
    ('RP_EAUCH', 'rp_eau_chaude'),
] -%}

{# Ancienneté de construction : nomenclature différente par millésime #}
{%- set ach_22 = [
    ('RP_ACHTOT', 'rp_ach_total'),
    ('RP_ACH1919', 'rp_avant_1919'),
    ('RP_ACH1945', 'rp_1919_1945'),
    ('RP_ACH1970', 'rp_1946_1970'),
    ('RP_ACH1990', 'rp_1971_1990'),
    ('RP_ACH2005', 'rp_1991_2005'),
    ('RP_ACH2019', 'rp_2006_2019'),
] -%}

{%- set ach_16 = [
    ('RP_ACHTOT', 'rp_ach_total'),
    ('RP_ACH19', 'rp_avant_1919'),
    ('RP_ACH45', 'rp_1919_1945'),
    ('RP_ACH70', 'rp_1946_1970'),
    ('RP_ACH90', 'rp_1971_1990'),
    ('RP_ACH05', 'rp_1991_2005'),
    ('RP_ACH13', 'rp_2006_2013'),
] -%}

{%- set ach_11 = [
    ('RP_ACHTT', 'rp_ach_total'),
    ('RP_ACHT1', 'rp_avant_1946'),
    ('RP_ACHT2', 'rp_1946_1990'),
    ('RP_ACHT3', 'rp_1991_2008'),
] -%}

{%- set columns = [] -%}

{%- for year in years -%}
{%- for var_code, var_name in indicators -%}
{%- do columns.append(("P" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

{# Ancienneté par année #}
{%- for var_code, var_name in ach_22 -%}
{%- do columns.append(("P22_" ~ var_code, var_name ~ "_22")) -%}
{%- endfor -%}
{%- for var_code, var_name in ach_16 -%}
{%- do columns.append(("P16_" ~ var_code, var_name ~ "_16")) -%}
{%- endfor -%}
{%- for var_code, var_name in ach_11 -%}
{%- do columns.append(("P11_" ~ var_code, var_name ~ "_11")) -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in columns %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
WHERE variable LIKE 'P%'
GROUP BY codgeo

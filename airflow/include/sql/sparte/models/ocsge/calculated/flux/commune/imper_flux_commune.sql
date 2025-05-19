{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

/*

Etant donné qu'il est possible qu'il n'y ait aucun objet de différence OCS GE sur une commune
entre deux millésimes, il est nécessaire de démarrer la requête par la table commune,
en la filtrant sur la base des millésimes de différence, en coalescent par 0 les valeurs
absentes.

La même requête est utilisée pour la table artif_flux_commune.

*/

with without_percent as (
SELECT
    commune_code,
    commune_surface,
    year_old,
    year_new,
    sum(surface) as impermeable_surface
FROM
    {{ ref('commune_flux_couverture_et_usage')}}
WHERE
    new_is_impermeable
group by
    commune_code, commune_surface,  year_old, year_new
), with_percent as (
SELECT
   without_percent.*,
    impermeable_surface / commune_surface * 100 as percent
FROM
    without_percent
)
SELECT
    commune.code as commune_code,
    commune.surface as commune_surface,
    diff_millesimes.year_old,
    diff_millesimes.year_new,
    COALESCE(with_percent.impermeable_surface, 0) as flux_imper,
    COALESCE(with_percent.percent, 0) as flux_imper_percent

FROM {{ ref('commune')}}
INNER JOIN
{{ ref('diff_millesimes') }}
ON commune.departement = diff_millesimes.departement
LEFT JOIN
with_percent
ON commune.code = with_percent.commune_code
ORDER BY impermeable_surface ASC

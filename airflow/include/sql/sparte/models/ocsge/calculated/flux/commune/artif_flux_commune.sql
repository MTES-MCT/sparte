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

with artif_data as (
SELECT
    commune_code,
    commune_surface,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    sum(CASE WHEN new_is_artificial THEN surface ELSE 0 END) as flux_artif,
    sum(CASE WHEN new_not_artificial THEN surface ELSE 0 END) as flux_desartif
FROM
    {{ ref('commune_flux_couverture_et_usage_artif')}}
group by
    commune_code, commune_surface, year_old, year_new, year_old_index, year_new_index
), with_net_and_percent as (
SELECT
    artif_data.*,
    flux_artif - flux_desartif as flux_artif_net,
    flux_artif / commune_surface * 100 as flux_artif_percent,
    flux_desartif / commune_surface * 100 as flux_desartif_percent,
    (flux_artif - flux_desartif) / commune_surface * 100 as flux_artif_net_percent
FROM
    artif_data
)
SELECT
    commune.code as commune_code,
    commune.surface as commune_surface,
    diff_millesimes.year_old,
    diff_millesimes.year_new,
    diff_millesimes.year_old_index,
    diff_millesimes.year_new_index,
    COALESCE(with_net_and_percent.flux_artif, 0) as flux_artif,
    COALESCE(with_net_and_percent.flux_desartif, 0) as flux_desartif,
    COALESCE(with_net_and_percent.flux_artif_net, 0) as flux_artif_net,
    COALESCE(with_net_and_percent.flux_artif_percent, 0) as flux_artif_percent,
    COALESCE(with_net_and_percent.flux_desartif_percent, 0) as flux_desartif_percent,
    COALESCE(with_net_and_percent.flux_artif_net_percent, 0) as flux_artif_net_percent,
    commune.departement

FROM {{ ref('commune')}}
INNER JOIN
{{ ref('diff_millesimes') }}
ON commune.departement = diff_millesimes.departement
LEFT JOIN
with_net_and_percent
ON commune.code = with_net_and_percent.commune_code
ORDER BY flux_artif ASC

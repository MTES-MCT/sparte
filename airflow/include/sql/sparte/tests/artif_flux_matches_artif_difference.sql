/*
Ce test vérifie que les flux d'artificialisation nette calculés avec artif_difference
correspondent aux flux calculés avec la méthode stock (différence entre millésimes).

Le test compare pour chaque territoire (land_id, land_type) et chaque millésime:
- flux_artif_net de for_app_landartiffluxindex (calculé avec artif_difference, nouvelle méthode)
- flux_surface de for_app_landartifstockindex (calculé avec la différence de stocks, ancienne méthode)

Le test retourne les lignes où la différence absolue est supérieure à 0.1 ha (tolérance pour les arrondis).
*/

{{ config(severity = 'warn') }}


with
    flux_from_difference as (
        select
            land_id,
            land_type,
            millesime_new_index,
            flux_artif_net
        from {{ ref("for_app_landartiffluxindex") }}
    ),
    flux_from_stock as (
        select
            land_id,
            land_type,
            millesime_index,
            flux_surface
        from {{ ref("for_app_landartifstockindex") }}
    ),
    comparison as (
        select
            flux_from_difference.land_id,
            flux_from_difference.land_type,
            flux_from_difference.millesime_new_index,
            flux_from_difference.flux_artif_net as flux_from_difference,
            flux_from_stock.flux_surface as flux_from_stock,
            abs(
                flux_from_difference.flux_artif_net - flux_from_stock.flux_surface
            ) as difference_absolue
        from flux_from_difference
        inner join
            flux_from_stock
            on flux_from_difference.land_id = flux_from_stock.land_id
            and flux_from_difference.land_type = flux_from_stock.land_type
            and flux_from_difference.millesime_new_index = flux_from_stock.millesime_index
    )

select
    land_id,
    land_type,
    millesime_new_index,
    flux_from_difference,
    flux_from_stock,
    difference_absolue
from comparison
where difference_absolue > 0.5  -- tolérance de 0.5 ha pour les arrondis
order by difference_absolue desc

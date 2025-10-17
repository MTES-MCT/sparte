
{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['land_type'], 'type': 'btree'},
            {'columns': ['land_id', 'land_type'], 'type': 'btree'},
            {'columns': ['status'], 'type': 'btree'}
        ]
    )
}}


with statut_counts as (
SELECT
    land_id,
    land_type,
    count(*) as friche_count,
    count(*) filter(where friche_statut = 'friche sans projet') as friche_sans_projet_count,
    count(*) filter(where friche_statut = 'friche avec projet') as friche_avec_projet_count,
    count(*) filter(where friche_statut = 'friche reconvertie') as friche_reconvertie_count,
    COALESCE(sum(surface), 0) as friche_surface,
    COALESCE(sum(surface) filter(where friche_statut = 'friche reconvertie'), 0) as friche_reconvertie_surface,
    COALESCE(sum(details.surface_artif) filter(where friche_statut = 'friche reconvertie'), 0)as friche_reconvertie_surface_artif,
    COALESCE(sum(details.surface_imper) filter(where friche_statut = 'friche reconvertie'), 0)as friche_reconvertie_surface_imper,
    COALESCE(sum(surface) filter(where friche_statut = 'friche avec projet'), 0) as friche_avec_projet_surface,
    COALESCE(sum(details.surface_artif) filter(where friche_statut = 'friche avec projet'), 0) as friche_avec_projet_surface_artif,
    COALESCE(sum(details.surface_imper) filter(where friche_statut = 'friche avec projet'), 0) as friche_avec_projet_surface_imper,
    COALESCE(sum(surface) filter(where friche_statut = 'friche sans projet'), 0) as friche_sans_projet_surface,
    COALESCE(sum(details.surface_artif) filter(where friche_statut = 'friche sans projet'), 0) as friche_sans_projet_surface_artif,
    COALESCE(sum(details.surface_imper) filter(where friche_statut = 'friche sans projet'), 0) as friche_sans_projet_surface_imper
 FROM {{ ref('friche_land') }}
 LEFT JOIN LATERAL (
    SELECT
        surface_artif,
        percent_artif,
        years_artif,
        surface_imper,
        percent_imper,
        years_imper
    FROM {{ ref('friche_details') }} WHERE site_id = friche_land.site_id LIMIT 1
 ) as details on true

 GROUP BY
    land_id,
    land_type
), status as (
SELECT
    land_id,
    land_type,
    CASE
        WHEN
            friche_sans_projet_surface = 0 AND
            friche_avec_projet_surface = 0 AND
            friche_reconvertie_surface = 0 THEN 'gisement nul et sans potentiel'
        WHEN
            /* pas de sans projet, mais avec projet et reconvertie != 0 */
            (
                friche_sans_projet_surface = 0 AND
                friche_avec_projet_surface > 0 AND
                friche_reconvertie_surface > 0
            ) OR (
                friche_sans_projet_surface = 0 AND
                friche_avec_projet_surface > 0 AND
                friche_reconvertie_surface = 0
            ) OR (
                friche_sans_projet_surface = 0 AND
                friche_avec_projet_surface = 0 AND
                friche_reconvertie_surface > 0
            ) THEN 'gisement nul car potentiel déjà exploité'
        WHEN
            friche_sans_projet_surface > 0 AND
            friche_avec_projet_surface = 0 AND
            friche_reconvertie_surface = 0 THEN 'gisement potentiel et non exploité'

        WHEN
            /* avec des sans projet, et un autre type */
            (
                friche_sans_projet_surface > 0 AND
                friche_avec_projet_surface > 0 AND
                friche_reconvertie_surface > 0
            ) OR (
                friche_sans_projet_surface > 0 AND
                friche_avec_projet_surface > 0 AND
                friche_reconvertie_surface = 0
            )  OR (
                friche_sans_projet_surface > 0 AND
                friche_avec_projet_surface > 0 AND
                friche_reconvertie_surface > 0
            ) OR (
                friche_sans_projet_surface > 0 AND
                friche_avec_projet_surface = 0 AND
                friche_reconvertie_surface > 0
            ) THEN 'gisement potentiel et en cours d’exploitation'
        ELSE 'erreur'
    END as status,
    friche_surface,
    friche_sans_projet_surface,
    friche_sans_projet_surface_artif,
    friche_sans_projet_surface_imper,
    friche_avec_projet_surface,
    friche_avec_projet_surface_artif,
    friche_avec_projet_surface_imper,
    friche_reconvertie_surface,
    friche_reconvertie_surface_artif,
    friche_reconvertie_surface_imper,
    friche_count,
    friche_avec_projet_count,
    friche_sans_projet_count,
    friche_reconvertie_count


FROM statut_counts
)
SELECT
    land_id,
    land_type,
    status,
    friche_surface,
    friche_reconvertie_surface,
    friche_reconvertie_surface_artif,
    friche_reconvertie_surface_imper,
    friche_avec_projet_surface,
    friche_avec_projet_surface_artif,
    friche_avec_projet_surface_imper,
    friche_sans_projet_surface,
    friche_sans_projet_surface_artif,
    friche_sans_projet_surface_imper,
    friche_count,
    friche_reconvertie_count,
    friche_avec_projet_count,
    friche_sans_projet_count
FROM
    status

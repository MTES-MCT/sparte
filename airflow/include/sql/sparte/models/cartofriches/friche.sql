{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['site_id'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ]
    )
}}

with without_surface as (
SELECT
    site_id,
    site_nom,
    {{ standardize_friche_type('site_type') }} as friche_type,
    site_adresse,
    site_identif_date,
    site_actu_date,
    site_surface,
    site_occupation,
    site_url,
    site_ademe_url,
    site_projet_url,
    site_securite,
    site_numero_basias,
    site_numero_basol,
    activite_libelle,
    activite_code,
    activite_fin_annee,
    comm_nom,
    comm_insee,
    dep,
    bati_type,
    bati_nombre,
    bati_surface,
    bati_pollution,
    bati_vacance,
    bati_patrimoine,
    bati_etat,
    local_ancienne_annee,
    local_recent_annee,
    proprio_type,
    proprio_personne,
    proprio_nom,
    unite_fonciere_surface,
    unite_fonciere_refcad,
    l_catpro3txt,
    friche_avec_vacance,
    taux_artif_ff,
    date_mutation,
    sol_pollution_annee,
    sol_pollution_existe as friche_sol_pollution,
    sol_pollution_origine,
    sol_pollution_commentaire,
    sol_depollution_fiche,
    {{ standardize_zonage_type('urba_zone_type') }} as friche_type_zone,
    urba_zone_type,
    urba_zone_lib,
    urba_zone_formdomi,
    urba_zone_formdomi_txt,
    urba_doc_type,
    urba_datappro,
    desserte_distance_route,
    desserte_distance_ferroviaire,
    desserte_distance_fluvial,
    desserte_distance_maritime,
    desserte_commentaire,
    producteur_fk,
    source_nom,
    source_producteur,
    {{ standardize_friche_nature('nature') }} as nature,
    source_contact,
    source_url,
    site_reconv_annee,
    site_reconv_type,
    CASE
        WHEN zone_activites = 'oui' THEN true
        WHEN zone_activites = 'non' THEN false
        ELSE NULL
    END as friche_is_in_zone_activite,
    site_vocadomi,
    monuhisto,
    monuhisto500,
    emprise_sol_bati,
    {{ standardize_friche_zonage_environnemental('zonage_enviro') }} as friche_zonage_environnemental,
    site_statut as friche_statut,
    long,
    lat,
    nom_prodcartofriches,
    commune.srid_source,
    {{
        make_valid_multipolygon(
            "ST_transform(friche.geom, commune.srid_source)"
        )
    }} as geom

FROM {{ source('public', 'cartofriches_friches')}} as friche
LEFT JOIN
    {{ ref('commune') }} as commune
ON st_transform(commune.geom, 4326) && friche.geom
AND st_contains(
    st_transform(commune.geom, 4326), st_pointonsurface(friche.geom)
)
WHERE friche.site_statut != 'friche potentielle'
), with_surface as (
SELECT
*,
ST_Area(geom) as surface
FROM without_surface
WHERE NOT ST_IsEmpty(geom)
), calculated_percentiles as (
    SELECT
    percentile_disc(0.25) within group (order by surface) as percentile_surface_25,
    percentile_disc(0.5) within group (order by surface) as percentile_surface_50,
    percentile_disc(0.75) within group (order by surface) as percentile_surface_75
    FROM
    with_surface
)
SELECT
with_surface.*,
CASE
    WHEN surface < percentile_surface_25 THEN 1
    WHEN surface < percentile_surface_50 THEN 2
    WHEN surface < percentile_surface_75 THEN 3
    ELSE 4
END AS friche_surface_percentile_rank
FROM with_surface
LEFT JOIN calculated_percentiles
ON true

/*

    Only use the intersection of the friche and the commune to determine
    the srid to transform the geometry.

    Without the st_pointonsurface, the intersection would return multiple
    communes for a given friche.

*/

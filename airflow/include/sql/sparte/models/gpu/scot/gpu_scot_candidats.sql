{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["name"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

-- Étape 1 de la sélection des périmètres SCoT du GPU (Géoportail de l'urbanisme) :
-- les SCoT candidats, avant résolution des conflits entre périmètres (cf. gpu_scot).
--
-- Règles :
--   - on garde tous les SCoT validés (`approved` = 1) ;
--   - on ajoute les SCoT en projet (`approved` = 0) seulement s'ils ne recouvrent pas
--     le territoire des validés : un SCoT en projet est retenu si la surface de son
--     intersection avec les validés est < 1 % de sa propre surface. Le test n'est pas
--     un simple NOT ST_Intersects, car presque tous les SCoT en projet touchent un
--     validé voisin le long d'une limite communale (slivers de quelques centaines de
--     m² à quelques km²). Les SCoT en projet qui fusionnent ou remplacent des validés
--     existants (recouvrement ~100 %) sont ainsi exclus ;
--   - un même SCoT (même `name` = 'scot_<siren>') peut ressortir en plusieurs
--     features (multi-polygone ou doublon) -> on recolle par ST_Union et on
--     regroupe par name ;
--   - gpu_timestamp = date la plus récente parmi les features du SCoT, utilisée par
--     gpu_scot pour départager deux SCoT qui revendiquent une même commune ;
--   - géométrie en EPSG:4326 (SRID natif de l'export GPU).
--
-- Matérialisé en table avec un index spatial : gpu_scot croise ces polygones avec
-- les points intérieurs de toutes les communes, ce qui est inexploitable sans index.

with valides as (
    select
        name,
        max(title) as title,
        max(gpu_timestamp) as gpu_timestamp,
        ST_Union(geom) as geom
    from {{ source('public', 'gpu_scot') }}
    where approved::int = 1
      and name is not null
    group by name
),

en_projet as (
    select
        name,
        max(title) as title,
        max(gpu_timestamp) as gpu_timestamp,
        ST_Union(geom) as geom
    from {{ source('public', 'gpu_scot') }}
    where approved::int = 0
      and name is not null
    group by name
),

en_projet_hors_valides as (
    select
        en_projet.name,
        en_projet.title,
        en_projet.gpu_timestamp,
        en_projet.geom
    from en_projet
    where coalesce((
        select sum(ST_Area(ST_Intersection(en_projet.geom, valides.geom)::geography))
        from valides
        where ST_Intersects(en_projet.geom, valides.geom)
    ), 0) < 0.01 * ST_Area(en_projet.geom::geography)
)

select name, title, gpu_timestamp, geom, true as approved from valides
union all
select name, title, gpu_timestamp, geom, false as approved from en_projet_hors_valides

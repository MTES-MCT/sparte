{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["id_scot"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

-- Périmètres SCoT du GPU (Géoportail de l'urbanisme), source de référence pour le
-- rattachement géographique commune -> SCoT (cf. scot_communes).
--
-- Étape 2 : résolution des conflits entre les candidats de gpu_scot_candidats.
--
-- Principe : on ne modifie jamais la composition d'un SCoT. Si deux SCoT candidats
-- revendiquent une même commune (le point intérieur de la commune tombe dans les deux
-- polygones), l'un des deux périmètres est périmé : on garde le plus récent
-- (gpu_timestamp le plus grand, un SCoT sans date étant considéré comme le plus
-- ancien) et on écarte l'autre en entier. Les communes écartées ne sont rattachées à
-- aucun SCoT tant que le porteur n'a pas mis le GPU à jour.
--
-- Les conflits se chaînent (A plus récent que B, B plus récent que C) : on parcourt
-- les candidats du plus récent au plus ancien, et un candidat est gardé s'il ne
-- partage aucune commune avec un candidat déjà gardé. Ainsi C est gardé si B, son
-- seul concurrent, a lui-même été écarté par A.
--
-- Les slivers de bordure (chevauchements de quelques m² qui ne contiennent le point
-- intérieur d'aucune commune) ne créent pas de conflit.
--
--   - id_scot = siren du porteur (name sans le préfixe 'scot_') ;
--   - géométrie en EPSG:4326.

with recursive candidats as (
    select * from {{ ref('gpu_scot_candidats') }}
),

-- commune -> tous les candidats dont le polygone contient son point intérieur.
-- Jointure sur la table (index gist) et non sur le CTE `candidats` : référencé
-- plusieurs fois, le CTE serait matérialisé et perdrait l'index. ~35 s au total.
rattachements as (
    select
        commune.code as commune_code,
        scot.name
    from {{ ref('commune_sans_scot') }} as commune
    inner join {{ ref('gpu_scot_candidats') }} as scot
        on ST_Intersects(scot.geom, ST_PointOnSurface(commune.geom_4326))
),

-- paires de candidats qui revendiquent au moins une commune en commun
conflits as (
    select distinct a.name as name_a, b.name as name_b
    from rattachements as a
    inner join rattachements as b
        on a.commune_code = b.commune_code
       and a.name <> b.name
),

-- ordre de priorité : du plus récent au plus ancien, sans date en dernier,
-- puis par name pour rendre le résultat déterministe
ordre as (
    select
        name::text as name,
        row_number() over (order by gpu_timestamp desc nulls last, name) as rang
    from candidats
),

-- parcours glouton : `gardes` accumule les names retenus au fil des rangs
selection as (
    select
        ordre.rang,
        array[ordre.name::text] as gardes
    from ordre
    where ordre.rang = 1

    union all

    select
        ordre.rang,
        case
            when exists (
                select 1
                from conflits
                where conflits.name_a = ordre.name
                  and conflits.name_b = any(selection.gardes)
            )
            then selection.gardes
            else selection.gardes || ordre.name::text
        end
    from selection
    inner join ordre on ordre.rang = selection.rang + 1
),

-- la dernière étape du parcours porte la liste complète des names gardés
gardes as (
    select unnest(derniere.gardes) as name
    from (
        select gardes
        from selection
        order by rang desc
        limit 1
    ) as derniere
)

select
    replace(candidats.name, 'scot_', '') as id_scot,
    replace(initcap(candidats.title), 'Scot', 'SCOT') as nom_scot,
    candidats.approved,
    candidats.gpu_timestamp,
    candidats.geom,
    4326 as srid_source
from candidats
inner join gardes on gardes.name = candidats.name

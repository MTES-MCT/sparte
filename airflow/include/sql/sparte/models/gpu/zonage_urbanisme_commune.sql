{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["part_id"], "type": "btree"},
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["srid_source"], "type": "btree"},
            {"columns": ["type_zone"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

/*
Zonages d'urbanisme découpés aux emprises communales : une ligne par couple
(zonage, commune), avec la géométrie restreinte à la commune.

C'est le grain de référence de toute la chaîne zonage. Il remplace `zonage_commune`,
qui se contentait de rattacher un zonage entier à chaque commune qu'il touchait :
en aval, `merge_ocsge_zonage_commune` sommait alors la surface INTÉGRALE du zonage
dans chacune de ces communes. 19 % des zonages touchent plus d'une commune, donc
autant de surfaces communales gonflées.

Points d'attention :

- `zonage_checksum` conserve la trace de l'unité. Les parts d'un même zonage se
  recomposent par regroupement sur cette colonne, ce qui permet de retrouver les
  statistiques du zonage entier sans dupliquer de géométrie.

- `ST_CollectionExtract(..., 3)` est indispensable : `ST_Intersection` renvoie une
  GeometryCollection dès qu'il y a contact tangent (point ou ligne), et ces
  fragments non surfaciques feraient échouer le cast en multipolygone.

- La somme des `part_surface` d'un zonage vaut sa surface TERRESTRE, pas
  `zonage_surface`. Les polygones Admin Express s'arrêtent au trait de côte alors
  que les PLU zonent aussi la mer : sur le Morbihan, 9,6 % de la surface des
  zonages est maritime (zones `Nm`, `Ns` Natura 2000) et disparaît donc ici.
  C'est assumé, ces zonages n'ont pas d'intérêt pour le produit. Sur un
  département sans littoral la couverture est de 100,000 %.
  Ne pas écrire de test d'égalité stricte entre les deux surfaces.

- Pas de test de non-chevauchement entre parts d'un même zonage : la propriété
  découle des communes elles-mêmes, qui ne se chevauchent pas. Le vérifier
  coûterait un produit cartésien sur ~1,6 M de lignes pour une garantie déjà
  acquise en amont.
*/

select
    zonage.checksum || '_' || commune.code as part_id,
    zonage.checksum as zonage_checksum,
    commune.code as commune_code,
    zonage.type_zone,
    zonage.libelle,
    zonage.libelle_long,
    zonage.destination_dominante,
    zonage.id_document_urbanisme,
    zonage.date_approbation,
    zonage.date_validation,
    zonage.gpu_timestamp,
    -- Département de la COMMUNE, pas celui du zonage : `zonage.departement` vient
    -- d'un LEFT JOIN LATERAL ... LIMIT 1 dans 3_zonage_urbanisme_projected, donc d'une
    -- commune choisie arbitrairement parmi celles que le zonage touche. Mesuré sur
    -- les départements 22/35/44/56 : 1 273 zonages ont des parts dans un autre
    -- département que celui qu'ils déclarent. La part appartient à sa commune.
    commune.departement,
    zonage.srid_source,
    zonage.surface as zonage_surface,
    part.surface as part_surface,
    part.geom
from {{ ref("zonage_urbanisme") }} as zonage
inner join {{ ref("commune") }} as commune
    on commune.srid_source = zonage.srid_source
    and zonage.geom && commune.geom
    and st_intersects(zonage.geom, commune.geom)
cross join lateral (
    select
        geom,
        round(st_area(geom)::numeric, 4) as surface
    from (
        select
            {{
                make_valid_multipolygon(
                    "st_collectionextract(st_intersection(zonage.geom, commune.geom), 3)"
                )
            }} as geom
    ) as clipped
) as part
where
    part.geom is not null
    and not st_isempty(part.geom)
    -- Le filtre porte sur la surface ARRONDIE, celle qui sera stockée, et pas sur
    -- st_area brut : une part de moins de 0,00005 m² passerait un test sur la valeur
    -- brute puis s'enregistrerait à 0,0000 après arrondi, et ferait diviser par zéro
    -- en aval. Mesuré sur le 56 : 12 parts dans ce cas.
    and part.surface > 0

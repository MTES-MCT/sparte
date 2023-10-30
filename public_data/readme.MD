

## Management commands


### shp2model

La commande attend un chemin relatif ou absolue vers un fichier shape (extension .shp).

Exemple : `./manage.py shp2model ./public_data/media/mondossier/monfichier.shp`

La commande va analyser le contenu du fichier et fournir un squelette de model selon les règles suivantes :
- Nom de la classe : nom du layer (en camelcase)
- Hérite de la classe `AutoLoadMixin`
- Un champ va être ajouté par feature avec pour nom le nom du champ en minuscule. Le type de champ est fonction du type OFT trouvé et le max_length est issu du field_width du fichier.
- un champ MultiPolygon est ajouté (nom: mpoly)
- le chemin vers le fichier est conservé dans la propriété shape_file_path
- le mapping entre les champs du fichier shape et les champs de la classe est conservé dans la propriété mapping

Exemple:
```
class Artificialisee2015to2018(AutoLoadMixin):
    """
    A_B_2015_2018 : la surface (en hectares) artificialisée entre 2015 et 2018
    Données construites par Philippe
    """

    surface = models.IntegerField(_("surface"), max_length=10)
    cs_2018 = models.CharField(_("cs_2018"), max_length=254)
    us_2018 = models.CharField(_("us_2018"), max_length=254)
    cs_2015 = models.CharField(_("cs_2015"), max_length=254)
    us_2015 = models.CharField(_("us_2015"), max_length=254)

    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/a_b_2015_2018/A_B_2015_2018.shp")
    mapping = {
        "surface": "Surface",
        "cs_2018": "cs_2018",
        "us_2018": "us_2018",
        "cs_2015": "cs_2015",
        "us_2015": "us_2015",
        "mpoly": "MULTIPOLYGON",
    }
```

### load_data et AutoLoadMixin

Ci-dessus, vous avez remarqué que le squelette hérite de la classe AutoLoadMixin (et nom models.Model comme il est de coutume). C'est pour que la classe embarque une méthode de classe "Load()" qui permet de charger les données en base depuis le fichier shape.

Cette fonctionnalité est activée au travers de la commande load_data qui prend le nom du classe en paramètre. Exemple : `./manage.py load_data public_data.models.Artificialisee2015to2018`

La méthode load() va :
- vider la base de donner (delete global)
- utiliser `LayerMapping` (issue de GeoDjango) avec les 2 propriétés détaillées précédemment : shape_file_path et mapping
- uploader le contenu du fichier dans la base

## Données de l'INSEE

2 données sont chargées depuis l'INSEE :
- Population des communes (incluant un historique depuis 2006)
- nombre de ménages par communes (incluant un historique depuis 2008)

Ces données sont stockées dans CommunePop et accessible depuis Commune.pop.all()

Pour charger ces données, 2 fichiers sont utilisées et ils doivent être disponibles dans s3://[bucketname]/data :
- pop : base-pop-historiques-1876-2019.xlsx, colonnes : CODGEO, LIBGEO, 2019 à 2006
- ménage : base-cc-coupl-fam-men-2018-lite.xlsx, colonnes : CODGEO, LIBGEO, 2018 à 2008

L'INSEE ne fournit le nombre de ménage que pour 2018, 2013 et 2008. Les années manquantes ont été complétées avec une estimation en utilisant une droite affine.

La commande pour charger les fichiers est : `python manage.py load_insee`

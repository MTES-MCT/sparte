

## Management commands

2 management commands ont été créées pour faciliter la vie du développeur et facilement intégrer des données produites par Philippe.

Histoire utilisateur:
- Philippe fourni un ensemble de fichiers dont un fichier .shp
- ces fichiers sont chargés dans pubic_data/media
- on utilise ensuite la commande `./manage.py shp2model ./public_data/media/mondossier/monfichier.shp` qui va produire un squelette de model GeoDjango
- le développeur copie colle le squelette dans le fichier models
- il nettoie les champs (par exemple pas de max_length dans les champs IntegerField)
- le développeur migre la base de données (makemigrations puis migrate)
- il peut enfin lancer la commande `./manage.py shp2model public_data.models.MaClasse` qui va lire le fichier shape et charger toutes les features en base

### shp2model

La commande attend un chemin relatif ou absolue vers un fichier shape (extension .shp).

Exemple : `./manage.py shp2model ./public_data/media/mondossier/monfichier.shp`

La commande va analyser le contenu du fichier et fournir un squelette de model selon les règles suivantes :
- Nom de la classe : nom du layer (en camelcase)
- Hérite de la classe `Autoload`
- Un champ va être ajouté par feature avec pour nom le nom du champ en minuscule. Le type de champ est fonction du type OFT trouvé et le max_length est issu du field_width du fichier.
- un champ MultiPolygon est ajouté (nom: mpoly)
- le chemin vers le fichier est conservé dans la propriété shape_file_path
- le mapping entre les champs du fichier shape et les champs de la classe est conservé dans la propriété mapping

Exemple:
```
class Artificialisee2015to2018(AutoLoad):
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

Améliorations:
- Ne pas mettre de max_length quand ce n'est pas un champ caractère
- Vérifier qu'il y a des données pour tous les enregistrement ou ajouter `null=True`

### load_data et Autoload

Ci-dessus, vous avez remarqué que le squelette hérite de la classe Autoload (et nom models.Model comme il est de coutume). C'est pour que la classe embarque une méthode de classe "Load()" qui permet de charger les données en base depuis le fichier shape.

Cette fonctionnalité est activée au travers de la commande load_data qui prend le nom du classe en paramètre. Exemple : `./manage.py load_data public_data.models.Artificialisee2015to2018`

La méthode load() va :
- vider la base de donner (delete global)
- utiliser `LayerMapping` (issue de GeoDjango) avec les 2 propriétés détaillées précédemment : shape_file_path et mapping
- uploader le contenu du fichier dans la base

Cette méthode permettra au développeur de facilement mettre à jour la base quand Philippe produira des nouveaux fichiers. Il lui suffira d'uploader les fichiers dans son répertoire puis de jouer les commandes ci-dessus.

Améliorations:
- Déclencher le load() depuis l'admin django
- uploader les fichiers depuis l'admin django

## Notes à propos de l'import du fichier d'artificialisation des communes

Pour que tout fonctionne bien, il faut fournir un fichier avec les entêtes suivantes:
* name
* insee
* surface
* artif_before_2009
* artif_2009
* artif_2010
* artif_2011
* artif_2012
* artif_2013
* artif_2014
* artif_2015
* artif_2016
* artif_2017
* artif_2018

Le format du fichier :
* CSV avec séparateur virgule ","
* l'encodage doit être utf-8 **sans bom**

Les informations numériques doivent être fourni au format US (pas d'espace pour les milliers et un point pour le séparateur des décimales)

La déduplication sera réalisée sur la colonne INSEE.

Voir le fichier exemple : example_import_artif_commune.csv

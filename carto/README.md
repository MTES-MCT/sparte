django_app carto
================

Cette app contient tout ce qui est nécessaire pour afficher une carte interactive en ligne, à savoir :
* un template html
* les librairies js et css leaflet
* la lib js custom qui offre une API pour afficher facilement la carte interactive depuis les autres views du projet

## Afficher une carte intéractive

### Information minimale

Pour afficher une carte intéractive, il suffit de créer une view avec les éléments suivants :
* utiliser le template carto/full_carto.html
* ajouter les informations de context minimales : centre de la carte et zoom

Cette configuration affichera une carte avec les orthophotos de l'IGN.

```python
from django.views.generic import TemplateView

class InteractiveMapView(TemplateView):
    template_name = "carto/full_carto.html"

    def get_context_data(self, **kwargs):
        kwargs.update(
            {
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 10,
            }
        )
        return super().get_context_data(**kwargs)
```

### Ajouter un calque

Vous pouvez ajouter des calques (ou "layers") en les listant dans le context. Chaque layer doit contenir !
* un nom
* une url vers un endpoint fournissant un Geojson
* un style de colorisation des formes

Le endpoint fournissant les données Geojson peut accepter un filtre sur le bbox (cadre englobant affiché dans le navigateur de l'utilisateur) afin d'accélérer le requêtage.

```python
from django.urls import reverse_lazy
from django.views.generic import TemplateView


class InteractiveMapView(TemplateView):
    template_name = "carto/full_carto.html"

    def get_context_data(self, **kwargs):
        kwargs.update(
            {
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 10,
                "layer_list": [
                    {
                        "name": "Communes",
                        "url": reverse_lazy("data:cities"),
                        "style": "style_communes",
                    },
            }
        )
        return super().get_context_data(**kwargs)
```

## Options des calques

| Nom | Valeurs | Description |
|-----|---------|-------------|
| color_property_name | alpha | Contient le nom de la propriété contenant la couleur de la feature. A combiner avec le style `get_color_from_property`. |
| display | True, False | le calque s'affiche au chargement (True) ou bien doit être activé manuellement par l'utilisateur (False) |
| level | 1 à 9 | ordre d'affichage des calques, plus le level est élevé plus le calques est au dessus des autres. 2 calques peuvent avoir le même level. |
| Name | alpha | nom du calque qui sera affiché dans le sélecteur |
| style | voir ci-dessous | indique quelle fonction utiliser pour coloriser les features du calques |
| url | url | endpoint permettant de récupérer les données d'un calque au format Geojson |

Les différents styles disponibles sont :
* style_communes
* style_emprise
* style_zone_artificielle
* get_color_from_property (à combiner avec color_property_name)
* get_color_for_ocsge_diff



GEOJson example:
```
{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}
```

"""Ce fichier contient tous les modèles dit "DEPRECATED". Ce sont des modèles qu'il
faut migrer vers les nouvelles façons de stocker les données. Cela nécessite souvent
beaucoup de travail (les views sont également à changer, voir le front) et cela a été
remis à plus tard (dette technique).

Il est également probable que certains modèles ont été total décommissioné mais pas
encore retiré de ce fichier.
"""
from .cerema import Cerema


class RefPlan(Cerema):
    """
    Utilisé avant la récupération du fichier du Cerema
    !!! DEPRECATED !!!
    Available for retro-compatibility
    """

    class Meta:
        proxy = True

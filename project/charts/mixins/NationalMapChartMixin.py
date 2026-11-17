"""
Titres des graphiques complémentaires de la carte nationale (/carte).

La carte nationale réutilise des graphiques écrits pour le diagnostic, dont le titre nomme le
territoire et la période (« … à Auvergne-Rhône-Alpes (2011 - 2024) »). Dans sa colonne, le
territoire est déjà nommé en tête de page et la place manque : chaque graphique y a une variante,
qui hérite de celui du diagnostic et ne change que ses textes, selon une règle unique :

- titre : ce que le graphique montre, en une ligne courte, dans les mots de la ligne du menu qui
  l'a fait afficher, sans le nom du territoire ni la période ;
- sous-titre : l'unité d'abord, puis la période ou les millésimes réellement représentés ;
- un millésime de l'OCS GE est désigné comme sur le reste du site, par son index (« millésime
  n°2 »), que la page explique, suivi des années du territoire entre parenthèses : le diagnostic
  ne donne que l'index pour un territoire à cheval sur des départements, et que l'année pour les
  autres.

Les graphiques du diagnostic et de l'export gardent ainsi leurs titres.
"""

# Espace insécable, devant « % »
NBSP = "\u00a0"

# Unité des surfaces, en tête de sous-titre
IN_HECTARES = "En hectares"


def period_text(start_year, end_year) -> str:
    """« de 2011 à 2024 », ou « en 2024 » pour une seule année."""
    start_year, end_year = int(start_year), int(end_year)
    return f"en {start_year}" if start_year == end_year else f"de {start_year} à {end_year}"


def millesime_years(item, suffix: str = "") -> list[int]:
    """
    Années d'un millésime de l'OCS GE : plusieurs pour un territoire à cheval sur des départements
    (données par index de millésime, champ `years`), une seule pour celles d'un département (`year`).
    """
    years = getattr(item, f"years{suffix}", None)
    return list(years) if years else [getattr(item, f"year{suffix}")]


def years_range(years) -> str:
    """« 2020 », ou « 2020 à 2023 » pour un millésime produit sur plusieurs années, selon les départements."""
    first, last = min(years), max(years)
    return str(first) if first == last else f"{first} à {last}"


def millesime_number(index, years=None) -> str:
    """« n°2 (2020) » : l'index d'un millésime, puis ses années ; l'index seul quand elles ne sont pas connues."""
    number = f"n°{index}"
    return f"{number} ({years_range(years)})" if years else number


def millesime_tick(index, years) -> str:
    """Étiquette d'un millésime sur un axe : l'index d'abord, ses années à la ligne."""
    return f"Millésime n°{index}<br/>({years_range(years)})"


def at_millesimes_text(millesimes: list[tuple[int, list[int]]]) -> str:
    """
    « au millésime n°2 (2020) », ou « aux millésimes n°1 (2017) et n°2 (2020) » : les millésimes
    d'un stock, chacun donné par son index et ses années, dans l'ordre.
    """
    numbers = [millesime_number(index, years) for index, years in millesimes]
    if len(numbers) == 1:
        return f"au millésime {numbers[0]}"
    return f"aux millésimes {', '.join(numbers[:-1])} et {numbers[-1]}"


def flux_subtitle(old_index, new_index, flux=None) -> str:
    """
    « En hectares, entre le millésime n°1 (2017) et le millésime n°2 (2020) » : l'unité d'un flux,
    et les deux millésimes entre lesquels il est mesuré ; sans flux, leurs années ne sont pas connues.
    """
    old = millesime_number(old_index, millesime_years(flux, "_old") if flux else None)
    new = millesime_number(new_index, millesime_years(flux, "_new") if flux else None)
    return f"{IN_HECTARES}, entre le millésime {old} et le millésime {new}"


class NationalMapChartMixin:
    """
    Variante d'un graphique du diagnostic pour la carte nationale : seuls le titre et le sous-titre
    changent. À placer avant la classe du graphique dans les bases de la variante.
    """

    # Titre de la variante
    national_map_title = ""

    @property
    def national_map_subtitle(self) -> str:
        raise NotImplementedError

    @property
    def param(self):
        param = super().param
        return param | {
            # Le style que le graphique donne à son titre est gardé
            "title": {**param.get("title", {}), "text": self.national_map_title},
            "subtitle": {"text": self.national_map_subtitle},
        }

    def get_param(self):
        param = super().get_param()
        # L'image téléchargée prend pour nom le titre du graphique : le territoire, qu'il ne nomme
        # plus, y est ajouté pour que deux images ne portent pas le même nom
        param["exporting"] = {**param["exporting"], "filename": f"{self.national_map_title} - {self.land.name}"}
        return param

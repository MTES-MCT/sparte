"""
Base class for bivariate choropleth maps crossing an INSEE indicator with
land consumption (NAF).  Each subclass only needs to define how to compute
the "indicator" value for each child territory and provide labels / titles.

Grid: 3 rows (conso terciles) × 3 cols (indicator terciles) = 9 categories.
Colors are obtained by bilinear interpolation of 4 corner colors.
"""

import json

from django.core.serializers import serialize
from django.db.models import Max, Sum

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import AdminRef, LandConso, LandModel

# ---------------------------------------------------------------------------
# Bivariate palette generation
#
# Each map defines 4 corner colors and the 9-color grid is computed via
# bilinear interpolation.
#
# Layout:
#                   Indic faible        Indic moyen         Indic fort
# Conso faible      TL                                      TR
# Conso moyenne
# Conso forte       BL                                      BR
# ---------------------------------------------------------------------------


def _lerp_color(c1, c2, t):
    """Linearly interpolate between two hex colors."""
    r1, g1, b1 = int(c1[1:3], 16), int(c1[3:5], 16), int(c1[5:7], 16)
    r2, g2, b2 = int(c2[1:3], 16), int(c2[3:5], 16), int(c2[5:7], 16)
    return "#{:02x}{:02x}{:02x}".format(
        int(r1 + (r2 - r1) * t),
        int(g1 + (g2 - g1) * t),
        int(b1 + (b2 - b1) * t),
    )


def bilinear_palette(tl, tr, bl, br):
    """Generate 3×3 = 9 colors via bilinear interpolation of 4 corner colors.

    tl = top-left     (low conso, low indic)
    tr = top-right    (low conso, high indic)
    bl = bottom-left  (high conso, low indic)
    br = bottom-right (high conso, high indic)

    Returns flat list of 9 hex colors, row by row (row 0 = low conso).
    """
    colors = []
    for row in range(3):
        ty = row / 2.0
        left = _lerp_color(tl, bl, ty)
        right = _lerp_color(tr, br, ty)
        for col in range(3):
            tx = col / 2.0
            colors.append(_lerp_color(left, right, tx))
    return colors


# Default palette (green) – used by DcPopulationConsoMap
PALETTE_GREEN = bilinear_palette("#74c476", "#006d2c", "#e34a33", "#fdcc8a")
# Blue – used by DcLogementConsoMap
PALETTE_BLUE = bilinear_palette("#9ecae1", "#084594", "#e34a33", "#fdbe85")
# Purple – used by DcEmploiConsoMap
PALETTE_PURPLE = bilinear_palette("#b5b8d9", "#4a1486", "#e34a33", "#fdbe85")
# Teal – used by DcMenagesConsoMap
PALETTE_TEAL = bilinear_palette("#99d8c9", "#00695c", "#e34a33", "#fdcc8a")
# Diverging green→red – used by DcVacanceConsoMap (both axes bad when high)
PALETTE_DIVERGING = bilinear_palette("#006d2c", "#fee08b", "#fc8d59", "#b30000")
# Orange – used by DcResidencesSecondairesConsoMap
PALETTE_ORANGE = bilinear_palette("#fdd49e", "#d94701", "#e34a33", "#fdcc8a")

CONSO_LABELS = ["faible", "moyenne", "forte"]
INDIC_LABELS = ["faible", "moyen(ne)", "fort(e)"]


def compute_terciles(values):
    """Return (t1, t2) thresholds splitting sorted values into 3 equal groups."""
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    if n < 3:
        return (sorted_vals[0], sorted_vals[-1])
    return (sorted_vals[n // 3], sorted_vals[2 * n // 3])


def classify_3x3(conso_val, indic_val, conso_t1, conso_t2, indic_t1, indic_t2):
    """Return category index 0-8."""
    if conso_val is None or conso_val <= conso_t1:
        row = 0
    elif conso_val > conso_t2:
        row = 2
    else:
        row = 1

    if indic_val is None:
        col = 1
    elif indic_val <= indic_t1:
        col = 0
    elif indic_val > indic_t2:
        col = 2
    else:
        col = 1

    return row * 3 + col


class DcBivariateConsoMap(DiagnosticChart):
    """
    Abstract base for bivariate maps: consumption × <indicator>.

    Subclasses must define:
      - indicator_name: str          (e.g. "Évolution de la population")
      - indicator_short: str         (e.g. "Évol. pop.")
      - indicator_unit: str          (e.g. "%")
      - indicator_model              (Django model class for the indicator)
      - compute_indicator_value(obj_or_none, start_field, end_field) -> float|None
      - indicator_fields: tuple      (start_field, end_field per period)
      - chart_title(child_label, period_label) -> str
      - chart_subtitle() -> str
      - tooltip_indicator_section(point_prefix) -> str  (HTML for tooltip)
      - verdicts: list[list[str]]    (3×3 qualitative descriptions)
    """

    required_params = ["child_land_type", "period"]

    # --- To override in subclasses ---
    indicator_name = ""
    indicator_short = ""
    indicator_unit = ""
    indicator_gender = "m"  # "m" or "f"
    indicator_model = None
    verdicts = [[""] * 3] * 3
    bivariate_colors = PALETTE_GREEN
    conso_field = "total"  # override with "activite" etc.

    @property
    def child_land_type(self):
        return self.params.get("child_land_type")

    @property
    def period(self):
        return self.params.get("period", "2016_2022")

    @property
    def period_years(self):
        """Return (indic_start_field, indic_end_field, conso_start, conso_end)."""
        raise NotImplementedError

    @property
    def period_label(self):
        p = self.period
        return p.replace("_", "-")

    @property
    def formatted_child_land_type(self):
        if self.child_land_type in [AdminRef.SCOT, AdminRef.EPCI]:
            return AdminRef.get_label(self.child_land_type)
        return AdminRef.get_label(self.child_land_type).lower()

    @property
    def lands(self):
        return LandModel.objects.filter(
            parent_keys__contains=[f"{self.land.land_type}_{self.land.land_id}"],
            land_type=self.child_land_type,
        )

    def compute_indicator_value(self, obj, start_field, end_field):
        """Compute the indicator value from the model object. Return float or None."""
        raise NotImplementedError

    def format_indicator(self, value):
        """Format indicator value for display."""
        if value is None:
            return "n.d."
        unit = self.indicator_unit
        if unit == "%":
            return f"{value:+.1f}%"
        return f"{value:,.1f}{(' ' + unit) if unit else ''}"

    # ----- Data computation (cached) -----

    @property
    def _raw_data(self):
        if hasattr(self, "_cached_raw"):
            return self._cached_raw

        indic_start_field, indic_end_field, conso_start, conso_end = self.period_years
        child_land_ids = list(self.lands.values_list("land_id", flat=True))
        child_type = self.child_land_type

        # Indicator data
        indic_data = {}
        if self.indicator_model:
            indic_data = {
                obj.land_id: obj
                for obj in self.indicator_model.objects.filter(
                    land_id__in=child_land_ids,
                    land_type=child_type,
                )
            }

        # Consumption + surface
        conso_qs = (
            LandConso.objects.filter(
                land_id__in=child_land_ids,
                land_type=child_type,
                year__gte=conso_start,
                year__lt=conso_end,
            )
            .values("land_id")
            .annotate(
                total_conso=Sum(self.conso_field),
                surface=Max("surface"),
            )
        )
        conso_data = {row["land_id"]: (row["total_conso"], row["surface"]) for row in conso_qs}

        rows = []
        for land_id in child_land_ids:
            indic_obj = indic_data.get(land_id)
            indic_val = self.compute_indicator_value(indic_obj, indic_start_field, indic_end_field)

            total_conso_m2, surface_m2 = conso_data.get(land_id, (0, 0))
            total_conso_m2 = total_conso_m2 or 0
            surface_m2 = surface_m2 or 0
            conso_ha = round(total_conso_m2 / 10000, 2)
            conso_pct = round(total_conso_m2 / surface_m2 * 100, 4) if surface_m2 > 0 else 0

            rows.append(
                {
                    "land_id": land_id,
                    "conso_ha": conso_ha,
                    "conso_pct": conso_pct,
                    "indic_val": indic_val,
                }
            )

        # Terciles (on relative consumption %)
        indic_values = [r["indic_val"] for r in rows if r["indic_val"] is not None]
        conso_values = [r["conso_pct"] for r in rows]

        indic_t1, indic_t2 = compute_terciles(indic_values) if len(indic_values) >= 3 else (0, 0)
        conso_t1, conso_t2 = compute_terciles(conso_values) if len(conso_values) >= 3 else (0, 0)

        self._cached_raw = (rows, conso_t1, conso_t2, indic_t1, indic_t2)
        return self._cached_raw

    @property
    def thresholds(self):
        _, conso_t1, conso_t2, indic_t1, indic_t2 = self._raw_data
        return conso_t1, conso_t2, indic_t1, indic_t2

    def _category_labels(self):
        labels = []
        for clabel in CONSO_LABELS:
            for ilabel in INDIC_LABELS:
                labels.append(f"Conso {clabel}, {self.indicator_short} {ilabel}")
        return labels

    @property
    def data(self):
        rows, conso_t1, conso_t2, indic_t1, indic_t2 = self._raw_data
        labels = self._category_labels()

        result = []
        for row in rows:
            cat_id = classify_3x3(
                row["conso_pct"],
                row["indic_val"],
                conso_t1,
                conso_t2,
                indic_t1,
                indic_t2,
            )
            verdict = self.verdicts[cat_id // 3][cat_id % 3] if self.verdicts else ""
            result.append(
                {
                    **row,
                    "category_id": cat_id,
                    "color": self.bivariate_colors[cat_id],
                    "category_label": labels[cat_id],
                    "verdict": verdict,
                    "conso_fmt": f"{row['conso_ha']:.2f}",
                    "conso_pct_fmt": f"{row['conso_pct']:.2f}",
                    "indic_fmt": self.format_indicator(row["indic_val"]),
                }
            )

        return result

    @property
    def data_table(self):
        _, _, conso_start, conso_end = self.period_years
        land_names = {land.land_id: land.name for land in self.lands}
        labels = self._category_labels()

        return {
            "headers": [
                AdminRef.get_label(self.child_land_type),
                self.indicator_short,
                f"Conso. {conso_start}-{conso_end} (%)",
                "Catégorie",
            ],
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": "",
                    "data": [
                        land_names.get(d["land_id"], d["land_id"]),
                        d["indic_fmt"],
                        f"{d['conso_pct_fmt']}%",
                        labels[d["category_id"]],
                    ],
                }
                for d in self.data
            ],
        }

    def get_chart_title(self):
        _, _, conso_start, conso_end = self.period_years
        child_label = self.formatted_child_land_type
        return (
            f"{self.indicator_name} et consommation d'espaces des {child_label}s"
            f" - {self.land.name} ({conso_start}-{conso_end})"
        )

    def get_chart_subtitle(self):
        return (
            f"Croisement entre {self.indicator_name.lower()} (INSEE) "
            "et la consommation d'espaces NAF (fichiers fonciers)"
        )

    @property
    def param(self):
        geojson = serialize(
            "geojson",
            self.lands,
            geometry_field="simple_geom",
            fields=("land_id", "name"),
            srid=3857,
        )

        labels = self._category_labels()
        conso_t1, conso_t2, indic_t1, indic_t2 = self.thresholds

        rows = self._raw_data[0]
        conso_values = [r["conso_pct"] for r in rows]
        indic_values = [r["indic_val"] for r in rows if r["indic_val"] is not None]

        return super().param | {
            "chart": {"map": json.loads(geojson)},
            "title": {"text": self.get_chart_title()},
            "subtitle": {"text": self.get_chart_subtitle()},
            "credits": INSEE_CREDITS,
            "custom": {
                "conso_t1": round(conso_t1, 4),
                "conso_t2": round(conso_t2, 4),
                "indic_t1": round(indic_t1, 2),
                "indic_t2": round(indic_t2, 2),
                "conso_min": round(min(conso_values), 4) if conso_values else None,
                "conso_max": round(max(conso_values), 4) if conso_values else None,
                "indic_min": round(min(indic_values), 2) if indic_values else None,
                "indic_max": round(max(indic_values), 2) if indic_values else None,
                "indicator_name": self.indicator_name,
                "indicator_short": self.indicator_short,
                "indicator_unit": self.indicator_unit,
                "indicator_gender": self.indicator_gender,
                "verdicts": self.verdicts,
                "colors": [self.bivariate_colors[i : i + 3] for i in range(0, 9, 3)],  # noqa: E203
            },
            "mapNavigation": {"enabled": True},
            "colorAxis": {
                "dataClasses": [
                    {"from": i, "to": i, "color": self.bivariate_colors[i], "name": labels[i]} for i in range(9)
                ],
            },
            "legend": {"enabled": False},
            "series": [
                {
                    "name": "Territoires",
                    "data": self.data,
                    "joinBy": ["land_id"],
                    "colorKey": "category_id",
                    "opacity": 1,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "pointFormat": (
                            "<b>{point.name}</b><br/><br/>"
                            f'<span style="font-weight:bold">{self.indicator_name}</span><br/>'
                            "{point.indic_fmt}<br/><br/>"
                            '<span style="font-weight:bold">Consommation d\'espaces NAF</span><br/>'
                            "{point.conso_pct_fmt}% ({point.conso_fmt} ha)<br/><br/>"
                            '<span style="color:{point.color}">\u25CF</span> '
                            "{point.category_label}<br/><br/>"
                            '<em style="font-size:0.85em">{point.verdict}</em>'
                        ),
                    },
                },
            ],
        }

"""
Base class for bivariate choropleth maps crossing an INSEE indicator with
land consumption (NAF).  Each subclass only needs to define how to compute
the "indicator" value for each child territory and provide labels / titles.

Grid: 3 rows (conso terciles) × 3 cols (indicator terciles) = 9 categories.
Colors are obtained by bilinear interpolation of 4 corner colors.
"""

from functools import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import AdminRef, LandModel
from public_data.models.administration import LandGeoJSON
from public_data.models.bivariate import (
    BivariateConsoThreshold,
    BivariateIndicThreshold,
    BivariateLandRate,
)

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
# Orange – used by DcResidencesSecondairesConsoMap
PALETTE_ORANGE = bilinear_palette("#fdd49e", "#d94701", "#e34a33", "#fdcc8a")

CONSO_LABELS = ["parmi les plus faibles", "intermédiaire", "parmi les plus élevées"]
INDIC_LABELS = ["parmi les plus faibles", "intermédiaire", "parmi les plus élevées"]


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

    Data (rates and thresholds) is pre-computed in dbt tables
    (BivariateLandRate, BivariateConsoThreshold, BivariateIndicThreshold).

    Subclasses define:
      - indicator_key: str           (e.g. "population", "logement")
      - indicator_name: str          (e.g. "Évolution de la population")
      - indicator_short: str         (e.g. "Évol. pop.")
      - indicator_unit: str          (e.g. "%")
      - indicator_gender: str        ("m" or "f")
      - bivariate_colors: list       (9 hex colors from bilinear_palette)
      - conso_field: str             ("total", "habitat", "activite")
      - verdicts: list[list[str]]    (3×3 qualitative descriptions)
    """

    required_params = ["child_land_type"]

    # --- To override in subclasses ---
    indicator_key = ""
    indicator_name = ""
    indicator_short = ""
    indicator_unit = ""
    indicator_gender = "m"
    verdicts = [["", "", ""], ["", "", ""], ["", "", ""]]
    bivariate_colors = PALETTE_GREEN
    conso_field = "total"

    CONSO_LABELS = {
        "total": "Consommation annuelle totale",
        "habitat": "Consommation annuelle pour l'habitat",
        "activite": "Consommation annuelle pour l'activité",
    }

    @property
    def conso_label(self):
        return self.CONSO_LABELS.get(self.conso_field, "Consommation annuelle d'espaces")

    @property
    def child_land_type(self):
        return self.params.get("child_land_type")

    @property
    def start_date(self):
        return int(self.params.get("start_date", 2011))

    @property
    def end_date(self):
        return int(self.params.get("end_date", 2022))

    @cached_property
    def _container_land(self):
        """The land used as container for child territories.
        For communes, returns the parent EPCI so the map shows all communes of the EPCI."""
        if self.land.land_type != AdminRef.COMMUNE:
            return self.land
        epci_key = next(
            (k for k in self.land.parent_keys if k.startswith(f"{AdminRef.EPCI}_")),
            None,
        )
        return LandModel.objects.filter(key=epci_key).first() if epci_key else self.land

    @property
    def formatted_child_land_type(self):
        if self.child_land_type in [AdminRef.SCOT, AdminRef.EPCI]:
            return AdminRef.get_label(self.child_land_type)
        return AdminRef.get_label(self.child_land_type).lower()

    @cached_property
    def lands(self):
        container = self._container_land
        return list(
            LandModel.objects.filter(
                parent_keys__contains=[f"{container.land_type}_{container.land_id}"],
                land_type=self.child_land_type,
            )
        )

    def format_indicator(self, value):
        """Format indicator value for display."""
        if value is None:
            return "n.d."
        unit = self.indicator_unit
        if unit == "%":
            return f"{value:+.1f}%"
        return f"{value:,.1f}{(' ' + unit) if unit else ''}"

    # ----- Data computation (cached) -----

    @cached_property
    def _raw_data(self):
        conso_start = self.start_date
        conso_end = self.end_date
        child_land_ids = [land.land_id for land in self.lands]
        child_type = self.child_land_type

        # Read pre-computed rates from dbt
        rates = list(
            BivariateLandRate.objects.filter(
                indicator=self.indicator_key,
                land_id__in=child_land_ids,
                land_type=child_type,
                start_year=conso_start,
                end_year=conso_end,
            )
        )

        rows = [
            {
                "land_id": r.land_id,
                "land_type": r.land_type,
                "conso_ha": float(r.conso_ha or 0),
                "conso_pct": float(r.conso_rate or 0),
                "indic_val": float(r.indic_rate) if r.indic_rate is not None else None,
            }
            for r in rates
        ]

        # Read national thresholds
        conso_th = BivariateConsoThreshold.objects.get(
            land_type=child_type,
            conso_field=self.conso_field,
            start_year=conso_start,
            end_year=conso_end,
        )
        conso_t1, conso_t2 = float(conso_th.t1_max), float(conso_th.t2_max)

        indic_th = BivariateIndicThreshold.objects.get(
            indicator=self.indicator_key,
            land_type=child_type,
            start_year=conso_start,
            end_year=conso_end,
        )
        indic_t1, indic_t2 = float(indic_th.t1_max), float(indic_th.t2_max)

        return (rows, conso_t1, conso_t2, indic_t1, indic_t2)

    @property
    def thresholds(self):
        _, conso_t1, conso_t2, indic_t1, indic_t2 = self._raw_data
        return conso_t1, conso_t2, indic_t1, indic_t2

    @cached_property
    def _category_labels(self):
        return [
            f"Consommation {clabel}, {self.indicator_short} {ilabel}"
            for clabel in CONSO_LABELS
            for ilabel in INDIC_LABELS
        ]

    @property
    def highlight_land_id(self):
        if self.land.land_type == AdminRef.COMMUNE:
            return self.land.land_id
        return self.params.get("highlight_land_id")

    @cached_property
    def data(self):
        rows, conso_t1, conso_t2, indic_t1, indic_t2 = self._raw_data
        labels = self._category_labels

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
            point = {
                **row,
                "category_id": cat_id,
                "color": self.bivariate_colors[cat_id],
                "category_label": labels[cat_id],
                "verdict": verdict,
                "conso_fmt": f"{row['conso_ha']:.2f}",
                "conso_pct_fmt": f"{row['conso_pct']:.2f}",
                "indic_fmt": self.format_indicator(row["indic_val"]),
            }
            result.append(point)

        return result

    @property
    def data_table(self):
        land_names = {land.land_id: land.name for land in self.lands}
        labels = self._category_labels

        return {
            "headers": [
                AdminRef.get_label(self.child_land_type),
                f"{self.indicator_short} ({self.indicator_unit}/an)" if self.indicator_unit else self.indicator_short,
                f"{self.conso_label} {self.start_date}-{self.end_date} (%/an)",
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
        child_label = self.formatted_child_land_type
        container = self._container_land
        if self.land.land_type == AdminRef.COMMUNE:
            return (
                f"Rythmes annuels de consommation et {self.indicator_name.lower()}"
                f" des {child_label}s"
                f" - {self.land.name} ({container.name}, {self.start_date}-{self.end_date})"
            )
        return (
            f"Rythmes annuels de consommation et {self.indicator_name.lower()}"
            f" des {child_label}s"
            f" - {container.name} ({self.start_date}-{self.end_date})"
        )

    def get_chart_subtitle(self):
        return f"Croisement entre {self.indicator_name.lower()} et la {self.conso_label.lower()} NAF"

    def _build_series(self):
        tooltip_format = {
            "headerFormat": "",
            "pointFormat": (
                "<b>{point.name}</b><br/>"
                f"{self.indicator_name} : "
                "<b>{point.indic_fmt}</b><br/>"
                "Consommation annuelle : <b>{point.conso_pct_fmt}%/an</b>"
            ),
        }
        main_series = {
            "name": "Territoires",
            "data": self.data,
            "joinBy": ["land_id"],
            "colorKey": "category_id",
            "opacity": 1,
            **({"cursor": "pointer"} if self.child_land_type != AdminRef.COMMUNE else {}),
            "borderColor": "#999999",
            "borderWidth": 1,
            "dataLabels": {"enabled": False},
            "tooltip": tooltip_format,
        }

        highlighted = self.highlight_land_id
        if not highlighted:
            return [main_series]

        highlight_point = next((p for p in self.data if p["land_id"] == highlighted), None)
        if not highlight_point:
            return [main_series]

        highlight_series = {
            "name": "Territoire sélectionné",
            "data": [highlight_point],
            "joinBy": ["land_id"],
            "colorKey": "category_id",
            "allAreas": False,
            "opacity": 1,
            "borderColor": "#000000",
            "borderWidth": 3,
            "dataLabels": {"enabled": False},
            "tooltip": tooltip_format,
            "showInLegend": False,
        }

        return [main_series, highlight_series]

    @property
    def param(self):
        container = self._container_land
        geojson = LandGeoJSON.for_parent(container.land_id, container.land_type, self.child_land_type)

        labels = self._category_labels
        conso_t1, conso_t2, indic_t1, indic_t2 = self.thresholds

        data = self.data
        conso_values = [d["conso_pct"] for d in data]
        indic_values = [d["indic_val"] for d in data if d["indic_val"] is not None]

        return super().param | {
            "chart": {"map": geojson},
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
                "conso_label": self.conso_label,
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
            "series": self._build_series(),
        }

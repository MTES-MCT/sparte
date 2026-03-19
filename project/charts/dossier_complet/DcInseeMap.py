from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import AdminRef, LandModel
from public_data.models.administration import LandGeoJSON


class DcInseeMap(DiagnosticChart):
    """Base class for INSEE dossier complet map charts.

    Subclasses must define:
        - dc_model: the Django model to query (e.g. LandDcPopulation)
        - map_title: title template (receives land_name and child_label)
        - color_key: the data key used for coloring
        - color_label: label for the color legend
        - max_color: hex color for max value
        - get_indicator_value(obj): returns the numeric value for coloring
        - get_tooltip_format(): returns the pointFormat string
        - get_data_row(obj, land_name): returns a dict for the data table row
        - data_table_headers: list of header strings
    """

    dc_model = None
    map_title = ""
    color_key = "value"
    color_label = ""
    max_color = "#6A6AF4"
    data_table_headers = []
    required_params = ["child_land_type"]

    @property
    def child_land_type(self):
        return self.params.get("child_land_type")

    @property
    def lands(self):
        return LandModel.objects.filter(
            parent_keys__contains=[f"{self.land.land_type}_{self.land.land_id}"],
            land_type=self.child_land_type,
        )

    @property
    def formatted_child_land_type(self):
        if self.child_land_type in [AdminRef.SCOT, AdminRef.EPCI]:
            return AdminRef.get_label(self.child_land_type)
        return AdminRef.get_label(self.child_land_type).lower()

    @property
    def dc_data(self):
        """Query the dc model for all children land_ids."""
        child_land_ids = list(self.lands.values_list("land_id", flat=True))
        return {
            obj.land_id: obj
            for obj in self.dc_model.objects.filter(
                land_id__in=child_land_ids,
                land_type=self.child_land_type,
            )
        }

    def get_indicator_value(self, obj):
        raise NotImplementedError

    def get_tooltip_format(self):
        raise NotImplementedError

    def get_data_row(self, obj, land_name):
        raise NotImplementedError

    @property
    def data(self):
        result = []
        for land_id, obj in self.dc_data.items():
            val = self.get_indicator_value(obj)
            if val is not None:
                result.append(
                    {
                        "land_id": land_id,
                        self.color_key: val,
                    }
                )
        return result

    @property
    def data_table(self):
        rows = []
        land_names = {land.land_id: land.name for land in self.lands}
        for land_id, obj in self.dc_data.items():
            row = self.get_data_row(obj, land_names.get(land_id, land_id))
            if row:
                rows.append(row)
        return {
            "headers": self.data_table_headers,
            "boldFirstColumn": True,
            "rows": rows,
        }

    @property
    def param(self):
        geojson = LandGeoJSON.for_parent(self.land.land_id, self.land.land_type, self.child_land_type)

        data_values = [d[self.color_key] for d in self.data if d[self.color_key] is not None]

        child_label = self.formatted_child_land_type
        title = self.map_title.format(child_label=child_label, land_name=self.land.name)

        return super().param | {
            "chart": {"map": geojson},
            "title": {"text": title},
            "credits": INSEE_CREDITS,
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": self.color_label},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": min(data_values) if data_values else 0,
                "max": max(data_values) if data_values else 1,
                "minColor": "#FFFFFF",
                "maxColor": self.max_color,
            },
            "series": [
                {
                    "name": self.color_label,
                    "data": self.data,
                    "joinBy": ["land_id"],
                    "colorKey": self.color_key,
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": self.get_tooltip_format(),
                    },
                },
            ],
        }


class DcPopulationMap(DcInseeMap):
    from public_data.models import LandDcPopulation

    dc_model = LandDcPopulation
    map_title = "Population des {child_label}s - {land_name} (2022)"
    color_key = "population"
    color_label = "Population (2022)"
    max_color = "#6A6AF4"
    data_table_headers = [
        "Territoire",
        "Population 2022",
        "Population 2016",
        "Population 2011",
    ]

    def get_indicator_value(self, obj):
        return obj.population_22

    def get_tooltip_format(self):
        return "<b>{point.name}</b>:<br/>Population: {point.population:,.0f}"

    def get_data_row(self, obj, land_name):
        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        return {
            "name": "",
            "data": [land_name, fmt(obj.population_22), fmt(obj.population_16), fmt(obj.population_11)],
        }


class DcLogementMap(DcInseeMap):
    from public_data.models import LandDcLogement

    dc_model = LandDcLogement
    map_title = "Logements des {child_label}s - {land_name} (2022)"
    color_key = "logements"
    color_label = "Logements (2022)"
    max_color = "#6A6AF4"
    data_table_headers = [
        "Territoire",
        "Logements 2022",
        "Rés. principales",
        "Rés. secondaires",
        "Vacants",
    ]

    def get_indicator_value(self, obj):
        return obj.logements_22

    def get_tooltip_format(self):
        return "<b>{point.name}</b>:<br/>" "Logements: {point.logements:,.0f}"

    def get_data_row(self, obj, land_name):
        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        return {
            "name": "",
            "data": [
                land_name,
                fmt(obj.logements_22),
                fmt(obj.residences_principales_22),
                fmt(obj.residences_secondaires_22),
                fmt(obj.logements_vacants_22),
            ],
        }


class DcLogementVacantMap(DcInseeMap):
    from public_data.models import LandDcLogement

    dc_model = LandDcLogement
    map_title = "Taux de logements vacants des {child_label}s - {land_name} (2022)"
    color_key = "taux_vacant"
    color_label = "Taux de vacance (%)"
    max_color = "#D6AE73"
    data_table_headers = [
        "Territoire",
        "Taux de vacance (%)",
        "Logements vacants",
        "Total logements",
    ]

    def get_indicator_value(self, obj):
        if obj.logements_22 and obj.logements_vacants_22:
            return round(obj.logements_vacants_22 / obj.logements_22 * 100, 1)
        return None

    def get_tooltip_format(self):
        return "<b>{point.name}</b>:<br/>Taux de vacance: {point.taux_vacant:.1f}%"

    @property
    def data(self):
        result = []
        for land_id, obj in self.dc_data.items():
            val = self.get_indicator_value(obj)
            if val is not None:
                result.append(
                    {
                        "land_id": land_id,
                        self.color_key: val,
                        "logements_vacants": obj.logements_vacants_22 or 0,
                        "logements_total": obj.logements_22 or 0,
                    }
                )
        return result

    def get_data_row(self, obj, land_name):
        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        taux = self.get_indicator_value(obj)
        return {
            "name": "",
            "data": [
                land_name,
                f"{taux:.1f}%" if taux is not None else "-",
                fmt(obj.logements_vacants_22),
                fmt(obj.logements_22),
            ],
        }


class DcResidencesSecondairesMap(DcInseeMap):
    from public_data.models import LandDcLogement

    dc_model = LandDcLogement
    color_key = "taux_rs"
    color_label = "Résidences secondaires (%)"
    max_color = "#d94701"
    required_params = ["child_land_type"]

    YEAR_FIELDS = {
        "2022": ("residences_secondaires_22", "logements_22"),
        "2016": ("residences_secondaires_16", "logements_16"),
        "2011": ("residences_secondaires_11", "logements_11"),
    }

    @property
    def year(self):
        return self.params.get("year", "2022")

    @property
    def rs_field(self):
        return self.YEAR_FIELDS[self.year][0]

    @property
    def log_field(self):
        return self.YEAR_FIELDS[self.year][1]

    @property
    def map_title(self):
        return (
            f"Part des résidences secondaires des {self.formatted_child_land_type}s - {self.land.name} ({self.year})"
        )

    @property
    def data_table_headers(self):
        return [
            "Territoire",
            f"Part rés. secondaires ({self.year}) (%)",
            "Rés. secondaires",
            "Total logements",
        ]

    def get_indicator_value(self, obj):
        total = getattr(obj, self.log_field, None)
        rs = getattr(obj, self.rs_field, None)
        if total and rs is not None and total > 0:
            return round(rs / total * 100, 1)
        return None

    def get_tooltip_format(self):
        return "<b>{point.name}</b>:<br/>" "Rés. secondaires: {point.taux_rs:.1f}%"

    @property
    def data(self):
        result = []
        for land_id, obj in self.dc_data.items():
            val = self.get_indicator_value(obj)
            if val is not None:
                result.append(
                    {
                        "land_id": land_id,
                        self.color_key: val,
                        "rs": getattr(obj, self.rs_field, 0) or 0,
                        "logements_total": getattr(obj, self.log_field, 0) or 0,
                    }
                )
        return result

    def get_data_row(self, obj, land_name):
        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        taux = self.get_indicator_value(obj)
        return {
            "name": "",
            "data": [
                land_name,
                f"{taux:.1f}%" if taux is not None else "-",
                fmt(getattr(obj, self.rs_field, None)),
                fmt(getattr(obj, self.log_field, None)),
            ],
        }

    @property
    def param(self):
        # Override to use dynamic title instead of format string
        child_label = self.formatted_child_land_type
        title = f"Part des résidences secondaires des {child_label}s - {self.land.name} ({self.year})"

        base = super(DcInseeMap, self).param  # skip DcInseeMap.param, go to DiagnosticChart
        geojson = LandGeoJSON.for_parent(self.land.land_id, self.land.land_type, self.child_land_type)
        data_values = [d[self.color_key] for d in self.data if d[self.color_key] is not None]

        return base | {
            "chart": {"map": geojson},
            "title": {"text": title},
            "credits": INSEE_CREDITS,
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": self.color_label},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": min(data_values) if data_values else 0,
                "max": max(data_values) if data_values else 1,
                "minColor": "#FFFFFF",
                "maxColor": self.max_color,
            },
            "series": [
                {
                    "name": self.color_label,
                    "data": self.data,
                    "joinBy": ["land_id"],
                    "colorKey": self.color_key,
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": self.get_tooltip_format(),
                    },
                },
            ],
        }


class DcEmploiMap(DcInseeMap):
    from public_data.models import LandDcActiviteChomage

    dc_model = LandDcActiviteChomage
    map_title = "Taux de chômage des {child_label}s - {land_name} (2022)"
    color_key = "taux_chomage"
    color_label = "Taux de chômage (%)"
    max_color = "#FA4B42"
    data_table_headers = [
        "Territoire",
        "Taux de chômage (%)",
        "Actifs occupés",
        "Chômeurs",
        "Pop. 15-64 ans",
    ]

    def get_indicator_value(self, obj):
        if obj.actifs_15_64_22 and obj.chomeurs_15_64_22:
            return round(obj.chomeurs_15_64_22 / obj.actifs_15_64_22 * 100, 1)
        return None

    def get_tooltip_format(self):
        return "<b>{point.name}</b>:<br/>Taux de chômage: {point.taux_chomage:.1f}%"

    def get_data_row(self, obj, land_name):
        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        taux = self.get_indicator_value(obj)
        return {
            "name": "",
            "data": [
                land_name,
                f"{taux:.1f}%" if taux is not None else "-",
                fmt(obj.actifs_occupes_15_64_22),
                fmt(obj.chomeurs_15_64_22),
                fmt(obj.pop_15_64_22),
            ],
        }


class DcRevenusMap(DcInseeMap):
    from public_data.models import LandDcRevenusPauvrete

    dc_model = LandDcRevenusPauvrete
    map_title = "Médiane du niveau de vie des {child_label}s - {land_name}"
    color_key = "mediane"
    color_label = "Médiane du niveau de vie (€)"
    max_color = "#00E272"
    data_table_headers = [
        "Territoire",
        "Médiane (€)",
        "Taux de pauvreté (%)",
    ]

    def get_indicator_value(self, obj):
        return obj.mediane_niveau_vie

    def get_tooltip_format(self):
        return "<b>{point.name}</b>:<br/>Médiane: {point.mediane:,.0f} €"

    def get_data_row(self, obj, land_name):
        def fmt(v):
            return f"{v:,.0f}" if v is not None else "-"

        def pct(v):
            return f"{v:.1f}%" if v is not None else "-"

        return {
            "name": "",
            "data": [land_name, fmt(obj.mediane_niveau_vie), pct(obj.taux_pauvrete)],
        }


class DcPauvreteMap(DcInseeMap):
    from public_data.models import LandDcRevenusPauvrete

    dc_model = LandDcRevenusPauvrete
    map_title = "Taux de pauvreté des {child_label}s - {land_name}"
    color_key = "taux_pauvrete"
    color_label = "Taux de pauvreté (%)"
    max_color = "#FA4B42"
    data_table_headers = [
        "Territoire",
        "Taux de pauvreté (%)",
        "Médiane (€)",
    ]

    def get_indicator_value(self, obj):
        return obj.taux_pauvrete

    def get_tooltip_format(self):
        return "<b>{point.name}</b>:<br/>Taux de pauvreté: {point.taux_pauvrete:.1f}%"

    def get_data_row(self, obj, land_name):
        def fmt(v):
            return f"{v:,.0f}" if v is not None else "-"

        def pct(v):
            return f"{v:.1f}%" if v is not None else "-"

        return {
            "name": "",
            "data": [land_name, pct(obj.taux_pauvrete), fmt(obj.mediane_niveau_vie)],
        }

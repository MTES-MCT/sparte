import base64
import copy
import json
import random
import os
import requests
import string
import tempfile

from django.conf import settings
from django.utils.safestring import mark_safe
from django.utils.text import slugify

from utils.functions import decimal2float


class ChartGenerationException(Exception):
    pass


class Chart:
    param = None
    name = None
    series = None

    def get_param(self):
        return copy.deepcopy(self.param)

    def __init__(self):
        self.chart = self.get_param()
        self.add_series()

    def get_series(self):
        return self.series

    def add_serie(self, name, data, **options):
        serie = {
            "name": name,
            "data": [{"name": n, "y": y} for n, y in data.items()],
        }
        serie.update(options)
        self.chart["series"].append(serie)

    def add_series(self, series=None, **options):
        """
        series : {
            "serie_1_name": {"point_name": "value", "point_name_2": "value", ...},
            "serie_2_name": {"point_name": "value", "point_name_2": "value", ...}
        }
        """
        if not series:
            series = self.get_series()
        for serie_name, data in series.items():
            self.add_serie(serie_name, data, **options)

    def dumps(self):
        chart_dumped = json.dumps(self.chart, default=decimal2float)
        chart_dumped = chart_dumped.replace("'", "\\'")
        return mark_safe(chart_dumped)  # nosec

    def get_name(self):
        if not self.name:
            try:
                self.name = self.chart["title"]["text"]
            except KeyError:
                pass
        if not self.name:
            self.name = "".join(
                random.choice(string.ascii_lowercase) for i in range(12)
            )
        return self.name

    def get_js_name(self):
        return slugify(self.get_name()).replace("-", "_")

    def get_legend_for_paper(self):
        return {
            "layout": "vertical",
            "align": "center",
            "verticalAlign": "bottom",
        }

    def request_b64_image_from_server(self):
        json_option = copy.deepcopy(self.chart)
        json_option["legend"] = self.get_legend_for_paper()
        data = {
            "infile": json_option,
            "width": 1000,
            "scale": False,
            "constr": "chart",
            "type": "image/png",
            "b64": True,
        }
        r = requests.post(settings.HIGHCHART_SERVER, json=data)
        if r.content.startswith(b"0x04 error when performing chart generation"):
            raise ChartGenerationException(json.dumps(data, default=decimal2float))
        return r.content

    def get_temp_image(self):
        b64_content = self.request_b64_image_from_server()
        fd, img_path = tempfile.mkstemp(suffix=".png", text=False)
        os.write(fd, base64.decodebytes(b64_content))
        os.close(fd)
        return img_path

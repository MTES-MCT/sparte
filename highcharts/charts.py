import base64
import copy
import json
import os
import random
import string
import tempfile
from typing import Any, Dict, List

import requests
from django.conf import settings
from django.utils.safestring import mark_safe
from django.utils.text import slugify

from utils.functions import decimal2float


class ChartGenerationException(Exception):
    pass


class RateLimitExceededException(Exception):
    pass


class Chart:
    param: Dict[str, Any] = {}
    name: str = ""
    series: List[Dict[str, Any]] = []
    options: Dict[str, Any] = {}

    def get_param(self) -> Dict[str, Any]:
        param = copy.deepcopy(self.param)
        param["navigation"] = {"buttonOptions": {"enabled": False}}
        param["credits"] = {"enabled": False}
        param["legend"] =  {**param["legend"], **{"width": 200, "itemStyle" : {"word-wrap": "break-word"}}}
        param["responsive"] = {
            "rules": [{
                "condition": {
                    "maxWidth": 600
                },
                "chartOptions": {
                    "legend": {
                        "align": "center",
                        "verticalAlign": "bottom",
                        "layout": "horizontal"
                    }
                }
            }]
        }
        return param

    def get_options(self, serie_name) -> Dict[str, Any]:
        return self.options.get(serie_name, dict())

    def __init__(self):
        self.chart = self.get_param()
        self.add_series()

    def get_series(self) -> List[Dict[str, Any]]:
        return self.series

    def add_serie(self, name, data, **options) -> None:
        serie = {
            "name": name,
            "data": [{"name": n, "y": y} for n, y in data.items()],
        }
        # update options according to class configuration
        serie.update(self.get_options(name))
        # add class options
        serie.update(options)
        self.chart["series"].append(serie)

    def add_series(self, series=None, **options) -> None:
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

    def dumps(self) -> str:
        chart_dumped = json.dumps(self.chart, default=decimal2float)
        chart_dumped = chart_dumped.replace("'", "\\'")
        return mark_safe(chart_dumped)  # nosec

    def get_name(self) -> str:
        if not self.name:
            try:
                self.name = self.chart["title"]["text"]
            except KeyError:
                pass
        if not self.name:
            self.name = "".join(random.choice(string.ascii_lowercase) for i in range(12))
        return self.name

    def get_js_name(self) -> str:
        return slugify(self.get_name()).replace("-", "_")

    def get_legend_for_paper(self) -> Dict[str, Any]:
        return {
            "layout": "vertical",
            "align": "center",
            "verticalAlign": "bottom",
        }

    def request_b64_image_from_server(self) -> bytes:
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
        r = requests.post(
            settings.HIGHCHART_SERVER,
            data=json.dumps(data, default=decimal2float),
            headers={"content-type": "application/json"},
        )
        if r.content.startswith(b"0x04 error when performing chart generation"):
            raise ChartGenerationException(json.dumps(data, default=decimal2float))
        if r.content.startswith(b'{"message":"Too many requests, you have been rate l'):
            raise RateLimitExceededException()
        return r.content + b"==="

    def get_temp_image(self) -> str:
        b64_content = self.request_b64_image_from_server()
        fd, img_path = tempfile.mkstemp(suffix=".png", text=False)
        os.write(fd, base64.decodebytes(b64_content))
        os.close(fd)
        return img_path

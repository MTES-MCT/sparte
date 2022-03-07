import json
import random
import string

from django.utils.safestring import mark_safe
from django.utils.text import slugify


class ChartCollection:
    def __init__(self, **options):
        self.charts = []
        self.options = options

    def append(self, chart):
        self.charts.append(chart)


class Chart:
    def __init__(self, chart, name=None):
        self.name = name
        self.chart = chart

    def add_serie(self, data):
        self.chart["series"].append(data)

    def dumps(self):
        chart_dumped = json.dumps(self.chart)
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

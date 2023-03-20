import json

import requests
from django.conf import settings


class JsonReader:
    def __init__(self):
        self.format = "json"

    def decode(self, request):
        return json.loads(request.content)


class Matomo:
    def __init__(self, reader=JsonReader, period=None, **init_params):
        self.url = "https://stats.data.gouv.fr/index.php"
        self.parameters = {
            "module": "API",
            "method": "Actions.getPageUrls",
            "idSite": 236,
            "period": "day",
            "date": "today",
            "token_auth": settings.MATOMO_TOKEN,
            "expanded": 1,
            "flat": 1,
        }
        self.set_period(*period)
        self.parameters.update(init_params)
        self.reader = reader()
        self.parameters.update({"format": self.reader.format})

    def set_period(self, *args):
        if args is None:
            return
        start, end = min(args), max(args)
        self.parameters.update(
            {
                "period": "range",
                "date": f"{start.strftime('%Y-%m-%d')},{end.strftime('%Y-%m-%d')}",
            }
        )

    def request(self):
        request = requests.get(self.url, params=self.parameters)
        return self.reader.decode(request)

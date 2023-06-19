import asyncio
from concurrent.futures import ThreadPoolExecutor

import requests
from django.core.management.base import BaseCommand

from public_data.models.gpu import ZoneUrba


class Command(BaseCommand):
    help = "Vérifie si une URL renvoie un fichier PDF"

    # @sync_to_async
    def is_pdf(self, url):
        try:
            response = requests.head(url, timeout=5)
            content_type = response.headers.get("Content-Type")
            if content_type and "application/pdf" in content_type.lower():
                return url
        except requests.exceptions.RequestException:
            pass
        return None

    async def main(self, *args, **options):
        items = (
            ZoneUrba.objects.filter(typezone="Ah", urlfic__startswith="h")
            .order_by("urlfic")
            .values("urlfic")
            .distinct()
        )
        print(items.count())
        for item in items:
            self.stdout.write(item["urlfic"])
            if await self.is_pdf(item["urlfic"]):
                self.stdout.write(item["urlfic"], ending="\n")

    def handle(self, *args, **options):
        urls = [
            _["urlfic"]
            for _ in (
                ZoneUrba.objects.filter(typezone="Nh", urlfic__startswith="h")
                .order_by("urlfic")
                .values("urlfic")
                .distinct()
            )
        ]
        # Convertir la coroutine en appel synchrone
        with ThreadPoolExecutor() as executor:
            loop = asyncio.get_event_loop()
            tasks = [loop.run_in_executor(executor, self.is_pdf, url) for url in urls]
            results = loop.run_until_complete(asyncio.gather(*tasks))

        for result in results:
            if result:
                print(result)

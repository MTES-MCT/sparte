import base64

from django.core.management.base import BaseCommand

from project.charts import DeterminantPieChart
from project.models import Project


class Command(BaseCommand):
    help = "Test get image from highchart"

    def handle(self, *args, **options):
        project = Project.objects.get(pk=8)
        chart = DeterminantPieChart(project)
        b64_content = chart.request_b64_image_from_server()
        with open("test_image.png", "wb") as f:
            f.write(base64.decodebytes(b64_content))
        # fd, img_path = tempfile.mkstemp(suffix=".png", text=False)
        # os.write(fd, base64.decodebytes(b64_content))
        # os.close(fd)
        # return img_path

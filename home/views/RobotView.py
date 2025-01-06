from django.views.generic import TemplateView


class RobotView(TemplateView):
    template_name = "home/robots.txt"
    content_type = "text/plain"

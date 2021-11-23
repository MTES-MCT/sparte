# from django.conf import settings
# from django.shortcuts import redirect
from django.views.generic import TemplateView


class Home(TemplateView):
    template_name = "home/home.html"

    # def get(self, request, *args, **kwargs):
    #     """Send user to connected part of the website if he is known"""
    #     if request.user and request.user.is_authenticated:
    #         return redirect(settings.LOGIN_REDIRECT_URL)
    #     return super().get(request, *args, **kwargs)

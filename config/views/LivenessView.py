from django.http import HttpResponse
from django.views import View


class LivenessView(View):
    def get(self, request):
        return HttpResponse("OK")

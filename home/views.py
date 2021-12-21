from django.views.generic import TemplateView, DetailView
from .models import FrequentlyAskedQuestion


class Home(TemplateView):
    template_name = "home/home.html"


class FrequentlyAskedQuestionDetail(DetailView):
    template_name = "home/faq_detail.html"
    context_object_name = "faq"
    queryset = FrequentlyAskedQuestion.objects.all()

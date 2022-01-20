from .models import FrequentlyAskedQuestion


def add_faq_to_context(request):
    qs = FrequentlyAskedQuestion.objects.filter(is_published=True)
    return {
        "menu_faq": qs,
    }

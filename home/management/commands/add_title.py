from django.core.management.base import BaseCommand

from dsfr.models import DsfrConfig


class Command(BaseCommand):
    def handle(self, *args, **options):
        qs = DsfrConfig.objects.all()
        if not qs.exists():
            config = DsfrConfig()
        else:
            config = qs.first()
        config.site_title = "SPARTE"
        config.site_tagline = (
            "Mesurer votre consommation d'espace et l'artificialisation de votre "
            "territoire"
        )
        config.footer_description = (
            "SPARTE est une start-up d'état en cours d'élaboration, la plateforme est "
            "en version BETA publique. Faites nous part de vos propositions pour "
            "améliorer ce service en envoyant un e-mail à "
            '<a href="mailto:sparte@beta.gouv.fr">sparte@beta.gouv.fr</a>. '
            "SPARTE est incubée à la Fabrique du numérique du Ministère de la "
            "Transition Ecologique, et membre de la communauté "
            '<a href="https://www.beta.gouv.fr">Beta Gouv</a>.'
        )
        config.save()

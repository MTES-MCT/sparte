from diagnostic_word.Template import TEMPLATES, TemplateName
from project.models import Request

from .base import BaseRenderer


class FullReportRenderer(BaseRenderer):
    def __init__(self, request: Request, word_template=TEMPLATES[TemplateName.RAPPORT_COMPLET]):
        super().__init__(request=request, word_template=word_template)

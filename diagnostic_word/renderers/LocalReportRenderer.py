from diagnostic_word.Template import TEMPLATES, TemplateName
from project.models import Request

from .base import BaseRenderer


class LocalReportRenderer(BaseRenderer):
    def __init__(self, request: Request, word_template=TEMPLATES[TemplateName.RAPPORT_LOCAL]):
        super().__init__(request=request, word_template=word_template)

from dataclasses import dataclass
from enum import StrEnum


class TemplateName(StrEnum):
    RAPPORT_COMPLET = "template-rapport-complet.docx"
    RAPPORT_CONSOMMATION = "template-rapport-consommation.docx"
    RAPPORT_LOCAL = "template-rapport-local.docx"


@dataclass
class Template:
    description: str
    docx: str
    filename_template: str


TEMPLATES = {
    TemplateName.RAPPORT_COMPLET: Template(
        description="Rapport complet",
        docx="template-rapport-complet.docx",
        filename_template="{diagnostic_name} {start_date} à {end_date} issu de MonDiagnosticArtificialisation.docx",
    ),
    TemplateName.RAPPORT_CONSOMMATION: Template(
        description="Rapport consommation",
        docx="template-rapport-consommation.docx",
        filename_template="Rapport de consommation {diagnostic_name} {start_date} à {end_date} issu de MonDiagnosticArtificialisation.docx",  # noqa: E501
    ),
    TemplateName.RAPPORT_LOCAL: Template(
        description="Rapport local",
        docx="template-rapport-local.docx",
        filename_template="Rapport local {diagnostic_name} {start_date} à {end_date} issu de MonDiagnosticArtificialisation.docx",  # noqa: E501
    ),
}

"""Nettoyage du HTML saisi dans les zones de commentaire des rapports.

Le HTML est entièrement reconstruit à partir d'une liste blanche : seules les balises que
produit l'éditeur (paragraphes, gras, italique, listes) sont conservées, sans aucun
attribut, et tout le texte est échappé. Rien de la saisie n'est recopié tel quel, ce qui
empêche l'injection de script (balises, attributs `on*`, URL `javascript:`…).
"""

from html import escape
from html.parser import HTMLParser

ALLOWED_TAGS = frozenset({"p", "strong", "em", "b", "i", "ul", "ol", "li", "br"})
VOID_TAGS = frozenset({"br"})
# Balises dont le contenu est supprimé avec elles (et non conservé comme texte)
DROPPED_CONTENT_TAGS = frozenset({"script", "style", "template", "iframe", "object", "noscript", "textarea", "title"})


class _AllowlistHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.open_tags: list[str] = []
        self.dropped_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in DROPPED_CONTENT_TAGS:
            self.dropped_depth += 1
            return
        if self.dropped_depth or tag not in ALLOWED_TAGS:
            return
        self.parts.append(f"<{tag}>")
        if tag not in VOID_TAGS:
            self.open_tags.append(tag)

    def handle_startendtag(self, tag: str, attrs) -> None:
        if not self.dropped_depth and tag in VOID_TAGS:
            self.parts.append(f"<{tag}>")

    def handle_endtag(self, tag: str) -> None:
        if tag in DROPPED_CONTENT_TAGS:
            self.dropped_depth = max(0, self.dropped_depth - 1)
            return
        if self.dropped_depth or tag not in self.open_tags:
            return
        # Ferme aussi les balises restées ouvertes à l'intérieur, pour un HTML bien formé
        while self.open_tags:
            open_tag = self.open_tags.pop()
            self.parts.append(f"</{open_tag}>")
            if open_tag == tag:
                break

    def handle_data(self, data: str) -> None:
        if not self.dropped_depth:
            self.parts.append(escape(data, quote=False))

    def result(self) -> str:
        self.close()
        while self.open_tags:
            self.parts.append(f"</{self.open_tags.pop()}>")
        return "".join(self.parts)


def sanitize_html(value: str) -> str:
    parser = _AllowlistHTMLParser()
    parser.feed(value)
    return parser.result()

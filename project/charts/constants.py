def format_anchor_for_credits(link: str, text: str) -> str:
    return f"<a style='color:blue' href='{link}'>{text}</a>"


DEFAULT_HEADER_FORMAT = "<b>{series.name}</b><br/>"
DEFAULT_POINT_FORMAT = "{point.name}: {point.y}"
DEFAULT_VALUE_DECIMALS = 2
CREDIT_PIXEL_SIZE = 10
DEFAULT_CREDIT_STYLE = {
    "cursor": "initial",
    "color": "#161616",
    "font-size": f"{CREDIT_PIXEL_SIZE}px",
}
DEFAULT_CREDIT_POSITION = {
    "y": -3,
    "align": "right",
    "verticalAlign": "bottom",
}


def get_multiple_line_credit_position(line_count=2) -> dict[str, int]:
    return {
        "y": CREDIT_PIXEL_SIZE * -1 * line_count,
    }


CEREMA_CREDITS = {
    "enabled": True,
    "text": "Source : Fichiers fonciers au 1er janvier 2023 (Cerema)",
    "style": DEFAULT_CREDIT_STYLE,
    "position": DEFAULT_CREDIT_POSITION,
}

OCSGE_CREDITS = {
    "enabled": True,
    "text": "Source : OCS GE (IGN)",
    "style": DEFAULT_CREDIT_STYLE,
    "position": DEFAULT_CREDIT_POSITION,
}

PAGE_INDICATEUR_URL = "https://artificialisation.developpement-durable.gouv.fr/mesurer-lartificialisation-avec-locsge/acceder-aux-analyses-realisees-partir-des-donnees-ocsge"  # noqa E501
IMPERMEABLE_OCSGE_CREDITS_ANCHOR_FORMATTED = format_anchor_for_credits(
    link=PAGE_INDICATEUR_URL,
    text="fiche indicateur du portail de l'artificialisation",
)

IMPERMEABLE_OCSGE_CREDITS = {
    **OCSGE_CREDITS,
    "position": get_multiple_line_credit_position(line_count=3),
    "text": f"Source : OCS GE (IGN)<br/>Calcul de l'imperméabilisation issu de la<br/>{IMPERMEABLE_OCSGE_CREDITS_ANCHOR_FORMATTED}",  # noqa E501
}

INSEE_CREDITS = {
    "enabled": True,
    "text": "Source : INSEE",
    "style": DEFAULT_CREDIT_STYLE,
    "position": DEFAULT_CREDIT_POSITION,
}

LEGEND_NAVIGATION_EXPORT = {"enabled": False}

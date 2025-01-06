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

IMPERMEABLE_OCSGE_CREDITS = {
    **OCSGE_CREDITS,
    "position": get_multiple_line_credit_position(line_count=3),
    "text": "Source : OCS GE (IGN)",  # noqa E501
}

INSEE_CREDITS = {
    "enabled": True,
    "text": "Source : INSEE",
    "style": DEFAULT_CREDIT_STYLE,
    "position": DEFAULT_CREDIT_POSITION,
}


def missing_ocsge_diff_message(missing_indicateur: str) -> str:
    return (
        "Aucune différence d'usage ou de couverture du sol n'a été enregistrée sur cette période "
        "pour ce territoire.<br>"
        f"Il est donc impossible d'observer des mouvements d'{missing_indicateur}."
    )


MISSING_OCSGE_DIFF_MESSAGE_ARTIF = missing_ocsge_diff_message("artificialisation")
MISSING_OCSGE_DIFF_MESSAGE_IMPER = missing_ocsge_diff_message("imperméabilisation")

LANG_MISSING_OCSGE_DIFF_ARTIF = {
    "noData": MISSING_OCSGE_DIFF_MESSAGE_ARTIF,
}
LANG_MISSING_OCSGE_DIFF_IMPER = {
    "noData": MISSING_OCSGE_DIFF_MESSAGE_IMPER,
}

NO_DATA_STYLE = {
    "position": "absolute",
    "backgroundColor": "#ffffff",
    "textAlign": "center",
    "textAlignLast": "center",
    "fontSize": "0.85em",
    "padding": "15px",
}

LEGEND_NAVIGATION_EXPORT = {"enabled": False}

ARTIFICIALISATION_COLOR = "#fa4b42"
DESARTIFICIALISATION_COLOR = "#00e272"
ARTIFICIALISATION_NETTE_COLOR = "#6a6af4"
HIGHLIGHT_COLOR = "#fa4b42"

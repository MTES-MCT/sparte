DEFAULT_HEADER_FORMAT = "<b>{series.name}</b><br/>"
DEFAULT_POINT_FORMAT = "{point.name}: {point.y}"
DEFAULT_VALUE_DECIMALS = 2
DEFAULT_CREDIT_STYLE = {
    "cursor": "initial",
    "color": "#161616",
    "font-size": "10px",
}
DEFAULT_CREDIT_POSITION = {
    "y": -3,
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

INSEE_CREDITS = {
    "enabled": True,
    "text": "Source : INSEE",
    "style": DEFAULT_CREDIT_STYLE,
    "position": DEFAULT_CREDIT_POSITION,
}

LEGEND_NAVIGATION_EXPORT = {"enabled": False}

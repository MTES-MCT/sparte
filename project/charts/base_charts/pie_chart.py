from project.charts.constants import DEFAULT_VALUE_DECIMALS

base_config_pie_chart = {
    "chart": {"type": "pie"},
    "tooltip": {
        "valueSuffix": " Ha",
        "valueDecimals": DEFAULT_VALUE_DECIMALS,
        "pointFormat": "{point.code} - {point.long_name} - {point.percentage:.1f}%",
        "headerFormat": "<b>{point.key}</b><br/>",
    },
    "plotOptions": {
        "pie": {
            "innerSize": "60%",
            "dataLabels": {
                "enabled": True,
                "overflow": "justify",
                "format": "{point.name} - {point.percentage:.2f}%",
                "style": {
                    "textOverflow": "clip",
                    "width": "100px",
                },
            },
        }
    },
}

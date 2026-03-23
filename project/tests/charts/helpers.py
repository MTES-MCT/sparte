import json


def normalize(obj):
    """Recursively sort lists in a nested structure for order-independent comparison."""
    if isinstance(obj, dict):
        return {k: normalize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        normalized = [normalize(item) for item in obj]
        try:
            return sorted(normalized, key=lambda x: json.dumps(x, sort_keys=True, default=str))
        except TypeError:
            return normalized
    return obj

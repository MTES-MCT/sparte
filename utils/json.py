from decimal import Decimal


def decimal2float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    else:
        raise TypeError("Obj is not a Decimal")

from django.db.models import Sum

from public_data.models.cerema import Cerema


class GetDataFromCeremaMixin:
    def get_qs_cerema(self):
        raise NotImplementedError("Need to be specified in child")

    def get_conso_per_year(self, start="2010", end="2020", coef=1):
        """Return Cerema data for the city, transposed and named after year"""
        fields = Cerema.get_art_field(start, end)
        qs = self.get_qs_cerema()
        args = (Sum(field) for field in fields)
        qs = qs.aggregate(*args)
        return {f"20{key[3:5]}": float(val / 10000) * float(coef) for key, val in qs.items()}

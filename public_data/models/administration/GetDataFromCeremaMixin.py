class GetDataFromCeremaMixin:
    def get_conso_per_year(self, start="2010", end="2020", coef=1):
        from public_data.domain.containers import PublicDataContainer

        from .Land import Land

        conso = PublicDataContainer.consommation_progression_service().get_by_land(
            land=Land(public_key=f"{self.land_type}_{self.get_official_id()}"),
            start_date=int(start),
            end_date=int(end),
        )

        return {f"{c.year}": float(c.total) for c in conso.consommation}

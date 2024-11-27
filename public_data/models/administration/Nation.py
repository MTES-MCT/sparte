class Nation:
    source_id = "NATION"
    name = "France"

    land_type = "NATION"
    land_type_label = "Nation"
    default_analysis_level = "REGION"

    @property
    def official_id(self) -> str:
        return self.source_id

    def get_ocsge_millesimes(self) -> set:
        pass

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        pass

    def get_qs_cerema(self):
        pass

    def get_cities(self):
        pass

    def __str__(self):
        return self.name

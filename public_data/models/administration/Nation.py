class Nation:
    """
    Ce modèle copie le format des autres modèles de territoire pour les nations,
    et est utilisé comme niveau de comparison pour les régions.
    """

    source_id = "NATION"
    name = "France"

    land_type = "NATION"
    land_type_label = "Nation"
    default_analysis_level = "REGION"

    @property
    def official_id(self) -> str:
        return self.source_id

    @classmethod
    def search(cls, *args, **kwargs):
        return []

    def __str__(self):
        return self.name

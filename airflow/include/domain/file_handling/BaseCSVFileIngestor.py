from abc import ABC, abstractmethod


class BaseCSVFileIngestor(ABC):
    def __init__(self, db_sqlalchemy_conn) -> None:
        # sqlalchemy est une dépendance qui n'est pas abstraite pour des raisons de simplicité
        self.db_sqlalchemy_conn = db_sqlalchemy_conn

    @abstractmethod
    def ingest_csv_to_table(
        self,
        file_path: str,
        table_name: str,
        separator: str = ";",
        skiprows=None,
    ) -> int:
        """
        Retourne le nombre de lignes insérées dans la table
        """

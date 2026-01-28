import logging

import pandas as pd
from sqlalchemy.types import TEXT

logger = logging.getLogger(__name__)


class XLSXFileIngestor:
    def __init__(self, db_sqlalchemy_conn) -> None:
        self.db_sqlalchemy_conn = db_sqlalchemy_conn

    def ingest_xlsx_to_table(
        self,
        file_path: str,
        table_name: str,
        sheet_name: str | int = 0,
        skiprows: int | None = None,
    ) -> int:
        """
        Ingère un fichier XLSX dans une table de la base de données.
        Retourne le nombre de lignes insérées.
        """
        if skiprows is not None and not isinstance(skiprows, int):
            raise ValueError("skiprows must be an integer or None")

        read_kwargs = {
            "sheet_name": sheet_name,
        }

        if skiprows is not None:
            read_kwargs["skiprows"] = skiprows

        df: pd.DataFrame = pd.read_excel(
            io=file_path,
            **read_kwargs,
        )

        return df.to_sql(
            name=table_name,
            con=self.db_sqlalchemy_conn,
            if_exists="replace",
            dtype={col_name: TEXT for col_name in df.columns},
        )

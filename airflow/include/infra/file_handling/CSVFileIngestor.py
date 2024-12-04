import pandas as pd
from include.domain.file_handling import BaseCSVFileIngestor


class CSVFileIngestor(BaseCSVFileIngestor):
    def ingest_csv_to_table(
        self,
        file_path: str,
        table_name: str,
        separator: str = ";",
        skiprows=None,
    ) -> int:
        if skiprows is not None and not isinstance(skiprows, int):
            raise ValueError("skiprows must be an integer or None")

        panda_read_kwargs = {}

        if skiprows is not None:
            panda_read_kwargs["skiprows"] = skiprows

        df: pd.DataFrame = pd.read_csv(
            filepath_or_buffer=file_path,
            sep=separator,
            low_memory=False,
            **panda_read_kwargs,
        )
        return df.to_sql(
            name=table_name,
            con=self.db_sqlalchemy_conn,
            if_exists="replace",
        )

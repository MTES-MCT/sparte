import logging
import os

import pandas as pd
from include.domain.file_handling import BaseCSVFileIngestor
from sqlalchemy.types import TEXT

logger = logging.getLogger(__name__)


class CSVFileIngestor(BaseCSVFileIngestor):
    def __ingest_large_csv_to_table(
        self,
        file_path: str,
        table_name: str,
        panda_read_kwargs: dict,
    ) -> int:
        chunksize = 100000
        panda_read_kwargs |= {
            "chunksize": chunksize,
        }
        iteration_count = 0

        chunks = pd.read_csv(
            filepath_or_buffer=file_path,
            low_memory=False,  # prevents mixed type errors
            **panda_read_kwargs,
        )

        row_count = sum(1 for _ in open(file_path, "r"))
        logger.info(f"File has {row_count} rows")

        for chunk in chunks:
            chunk.to_sql(
                name=table_name,
                con=self.db_sqlalchemy_conn,
                if_exists="append" if iteration_count != 0 else "replace",
                dtype={col_name: TEXT for col_name in chunk.columns},
            )
            iteration_count += 1
            logger.info(f"Inserted {iteration_count * chunksize} / {row_count} rows")

        return row_count

    def ingest_csv_to_table(
        self,
        file_path: str,
        table_name: str,
        separator: str = ";",
        skiprows=None,
    ) -> int:
        if skiprows is not None and not isinstance(skiprows, int):
            raise ValueError("skiprows must be an integer or None")

        panda_read_kwargs = {
            "sep": separator,
        }

        if skiprows is not None:
            panda_read_kwargs["skiprows"] = skiprows

        file_over_75mb = os.path.getsize(file_path) > 75 * 1024 * 1024

        if file_over_75mb:
            logger.info(f"File {file_path} is over 75MB, ingesting in chunks")
            return self.__ingest_large_csv_to_table(
                file_path=file_path,
                table_name=table_name,
                panda_read_kwargs=panda_read_kwargs,
            )

        df: pd.DataFrame = pd.read_csv(
            filepath_or_buffer=file_path,
            low_memory=False,  # prevents mixed type errors
            **panda_read_kwargs,
        )
        return df.to_sql(
            name=table_name,
            con=self.db_sqlalchemy_conn,
            if_exists="replace",
        )

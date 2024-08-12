"""
## Astronaut ETL example DAG

This DAG queries the list of astronauts currently in space from the
Open Notify API and prints each astronaut's name and flying craft.

There are two tasks, one to get the data from the API and save the results,
and another to print the results. Both tasks are written in Python using
Airflow's TaskFlow API, which allows you to easily turn Python functions into
Airflow tasks, and automatically infer dependencies and pass data.

The second task uses dynamic task mapping to create a copy of the task for
each Astronaut in the list retrieved from the API. This list will change
depending on how many Astronauts are in space, and the DAG will adjust
accordingly each time it runs.

For more explanation and getting started instructions, see our Write your
first DAG tutorial: https://docs.astronomer.io/learn/get-started-with-airflow
"""

from airflow.decorators import dag, task
from dependencies.container import Container
from gdaltools import ogr2ogr
from pendulum import datetime


# Define the basic parameters of the DAG, like schedule and start_date
@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["GPU"],
)
def parquet_test():
    @task.python
    def export() -> str:
        ogr = ogr2ogr()
        ogr.config_options["PG_USE_COPY"] = "YES"
        ogr.layer_creation_options["SPATIAL_INDEX"] = "YES"
        ogr.set_input(Container().gdal_dw_conn(), table_name="departement", srs="EPSG:2154")
        ogr.set_output(Container().gdal_prod_conn(), table_name="prod_departement", srs="EPSG:4326")
        ogr.execute()

    export()


parquet_test()

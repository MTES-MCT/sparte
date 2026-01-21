import pendulum
from dags.data_gouv.Config import CSVResourceConfig, GeopackageResourceConfig
from dags.data_gouv.utils import get_dataset_configs
from include.container import DomainContainer as Container
from include.container import InfraContainer

from airflow.decorators import dag, task, task_group

dataset_configs = get_dataset_configs()


@dag(
    dag_id="export_all_to_data_gouv",
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md="""
    DAG unique pour exporter toutes les données vers data.gouv.fr.

    Ce DAG exécute tous les exports définis dans configs.py.
    Chaque dataset peut contenir plusieurs ressources (CSV, Geopackage, etc.).
    """,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    max_active_tasks=5,
)
def export_all_to_data_gouv():  # noqa: C901
    s3_bucket = InfraContainer().bucket_name()

    for dataset_config in dataset_configs:

        @task_group(group_id=f"dataset_{dataset_config.dataset_slug}")
        def export_dataset_group(ds_cfg=dataset_config):
            @task.python(task_id="upsert_dataset")
            def upsert_dataset(ds_cfg=ds_cfg) -> str:
                """Crée ou récupère le dataset et retourne son ID."""
                dataset = (
                    Container()
                    .s3_to_data_gouv()
                    .get_or_create_dataset(
                        slug=ds_cfg.dataset_slug,
                        title=ds_cfg.dataset_title,
                    )
                )
                return dataset["id"]

            data_gouv_dataset_id = upsert_dataset()

            for resource in ds_cfg.resources:

                @task_group(group_id=f"resource_{resource.resource_slug}")
                def export_resource_group(ds_cfg=ds_cfg, res_cfg=resource):
                    if isinstance(res_cfg, CSVResourceConfig):
                        s3_key = f"exports/csv/{res_cfg.filename}"

                        @task.python(task_id="create")
                        def create_csv(res_cfg=res_cfg, s3_key=s3_key):
                            return (
                                Container()
                                .sql_to_csv_on_s3_handler()
                                .export_sql_result_to_csv_on_s3(
                                    s3_key=s3_key,
                                    s3_bucket=s3_bucket,
                                    sql=res_cfg.sql,
                                )
                            )

                        @task.python(task_id="upload")
                        def upload_csv(
                            dataset_id: str,
                            res_cfg=res_cfg,
                            s3_key=s3_key,
                        ):
                            return (
                                Container()
                                .s3_to_data_gouv()
                                .upload_resource_to_dataset(
                                    s3_key=s3_key,
                                    s3_bucket=s3_bucket,
                                    data_gouv_filename=res_cfg.filename,
                                    dataset_id=dataset_id,
                                    resource_slug=res_cfg.resource_slug,
                                    resource_title=res_cfg.resource_title,
                                )
                            )

                        create_csv() >> upload_csv(data_gouv_dataset_id)

                    elif isinstance(res_cfg, GeopackageResourceConfig):
                        s3_key = f"exports/geopackage/{res_cfg.filename}"

                        @task.python(task_id="create")
                        def create_gpkg(res_cfg=res_cfg, s3_key=s3_key):
                            return (
                                Container()
                                .sql_to_geopackage_on_s3_handler()
                                .export_sql_result_to_geopackage_on_s3(
                                    s3_key=s3_key,
                                    s3_bucket=s3_bucket,
                                    sql_to_layer_name_mapping=res_cfg.sql_to_layer_name_mapping,
                                )
                            )

                        @task.python(task_id="upload")
                        def upload_gpkg(
                            dataset_id: str,
                            res_cfg=res_cfg,
                            s3_key=s3_key,
                        ):
                            return (
                                Container()
                                .s3_to_data_gouv()
                                .upload_resource_to_dataset(
                                    s3_key=s3_key,
                                    s3_bucket=s3_bucket,
                                    data_gouv_filename=res_cfg.filename,
                                    dataset_id=dataset_id,
                                    resource_slug=res_cfg.resource_slug,
                                    resource_title=res_cfg.resource_title,
                                )
                            )

                        create_gpkg() >> upload_gpkg(data_gouv_dataset_id)

                export_resource_group()

        export_dataset_group()


export_all_to_data_gouv()

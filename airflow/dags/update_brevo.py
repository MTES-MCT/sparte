from include.container import DomainContainer, InfraContainer
from include.dbt import DbtBuild
from pendulum import datetime

from airflow.decorators import dag, task


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@daily",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["BREVO"],
)
def update_brevo():
    bucket_name = InfraContainer().bucket_name()
    s3_key = "brevo/user_data.csv"
    # Les tâches tournent dans des pods distincts : le CSV est lu directement sur S3,
    # jamais depuis un fichier local écrit par une autre tâche.
    path_on_bucket = f"{bucket_name}/{s3_key}"

    build_suv_on_dbt = DbtBuild(task_id="build_suv_on_dbt", select=["for_brevo"])

    @task.python
    def create_user_data_csv():
        return (
            DomainContainer()
            .sql_to_csv_on_s3_handler()
            .export_sql_result_to_csv_on_s3(
                s3_key=s3_key,
                s3_bucket=bucket_name,
                sql="SELECT * FROM public_for_brevo.for_brevo_user_info",
            )
        )

    @task.python
    def get_file_stats():
        size = InfraContainer().s3().size(path_on_bucket)
        size_in_mb = size / (1024 * 1024)  # Convert size to MB

        # check if size if greater than 8mb
        if size_in_mb > 8:
            raise ValueError("File size exceeds 8MB limit, it is too large to process by brevo.")

        return f"{round(size_in_mb, 2)} MB"

    @task.python
    def import_brevo_contacts() -> None:
        """Upsert contact information in Brevo."""
        brevo = InfraContainer().brevo()
        contact_csv_str = InfraContainer().s3().cat_file(path_on_bucket).decode("utf-8")
        list_ids = [10]
        # TODO : different env with different list ids
        return brevo.import_contacts(contact_csv_str, list_ids=list_ids)

    build_suv = build_suv_on_dbt
    csv_file = create_user_data_csv()
    stats = get_file_stats()
    import_contacts = import_brevo_contacts()

    build_suv >> csv_file >> stats >> import_contacts


update_brevo()

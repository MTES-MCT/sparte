import os

from include.container import DomainContainer, InfraContainer
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
    s3_key = "brevo/user_data.csv"
    local_tmp_file = "/tmp/user_data.csv"

    @task.python
    def create_user_data_csv():
        return (
            DomainContainer()
            .sql_to_csv_on_s3_handler()
            .export_sql_result_to_csv_on_s3(
                s3_key=s3_key,
                s3_bucket="airflow-staging",
                sql="SELECT * FROM public_for_brevo.for_brevo_user_info",
            )
        )

    @task.python
    def download_user_data_csv() -> list:
        return (
            DomainContainer()
            .s3_handler()
            .download_file(
                s3_bucket="airflow-staging",
                s3_key=s3_key,
                local_file_path=local_tmp_file,
            )
        )

    @task.python
    def get_file_stats():
        size = os.stat(local_tmp_file).st_size
        size_in_mb = size / (1024 * 1024)  # Convert size to MB

        # check if size if greater than 8mb
        if size_in_mb > 8:
            raise ValueError("File size exceeds 8MB limit, it is too large to process by brevo.")

        return f"{round(size_in_mb, 2)} MB"

    @task.python
    def import_brevo_contacts() -> None:
        """Upsert contact information in Brevo."""
        brevo = InfraContainer().brevo()
        with open(local_tmp_file, "r") as file:
            contact_csv_str = file.read()
        return brevo.import_contacts(contact_csv_str, list_ids=[10])

    csv_file = create_user_data_csv()
    local_user_data_path = download_user_data_csv()
    stats = get_file_stats()
    import_contacts = import_brevo_contacts()

    csv_file >> local_user_data_path >> stats >> import_contacts


update_brevo()

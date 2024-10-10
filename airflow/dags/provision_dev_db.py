import os

import pendulum
import requests
from airflow.decorators import dag, task
from airflow.models.param import Param
from include.container import Container
from psycopg2 import sql


def download_file_by_chunks(url, local_filename, chunk_size=8192):
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(local_filename, "wb") as f:
            for chunk in r.iter_content(chunk_size=chunk_size):
                f.write(chunk)
    return local_filename


@dag(
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    params={
        "db_name": Param(default="DB_NAME", type="string"),
        "user": Param(default="DB_USER", type="string", enum=["alexis", "sofian"]),
    },
)
def provision_dev_db():  # noqa: C901
    local_backup_path = "/tmp/backup.tar.gz"

    @task.python(retries=0)
    def check_db_name_is_valid_identifier(**context):
        db_name = context["params"]["db_name"]
        allowed_letters = "abcdefghijklmnopqrstuvwxyz-"
        invalid_letters_found = []
        for letter in db_name:
            if letter not in allowed_letters:
                invalid_letters_found.append(letter)

        if invalid_letters_found:
            raise ValueError(f"Invalid characters found in db_name: {invalid_letters_found}")

        return f"{db_name} is a valid identifier"

    @task.python(retries=0)
    def check_db_name_does_not_exist(**context):
        db_name = context["params"]["db_name"]
        conn = Container().psycopg2_dbt_conn()
        cursor = conn.cursor()
        params = {"dbname": db_name}
        query = """
            select exists(
                SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower(%(dbname)s)
        )
        """
        cursor.execute(query, params)
        result = cursor.fetchone()
        if result[0]:
            raise ValueError(f"Database {db_name} already exists")

    @task.python
    def get_download_url():
        return Container().scalingo().get_latest_backup_url()

    @task.python
    def delete_backup_if_exists_before():
        if os.path.exists(local_backup_path):
            os.remove(local_backup_path)

    @task.python
    def download_backup(url):
        download_file_by_chunks(url, local_backup_path)

    @task.bash
    def extract_backup():
        return f"tar -xvzf {local_backup_path} -C /tmp"

    @task.python
    def get_extracted_backup_path():
        files_in_tmp = os.listdir("/tmp")
        for file in files_in_tmp:
            if file.endswith(".pgsql"):
                return f"/tmp/{file}"

        raise ValueError("No .pgsql file found in /tmp")

    @task.python
    def create_db(**context):
        db_name = context["params"]["db_name"]
        conn = Container().psycopg2_dbt_conn()
        conn.autocommit = True

        cur = conn.cursor()
        cur.execute(sql.SQL("CREATE DATABASE {};").format(sql.Identifier(db_name)))
        cur.close()

    @task.bash
    def restore_db(extracted_file_path, **context):
        dbname = Container().dbt_conn_url(dbname=context["params"]["db_name"]).replace("_", "-")
        command = [
            "pg_restore",
            "--dbname",
            dbname,
            "--no-owner",
            "--no-privileges",
            "--no-tablespaces",
            "--no-comments",
            "--clean",
            "--if-exists",
            extracted_file_path,
        ]

        return " ".join(command)

    @task.python
    def grant_permission_to_user(**context):
        db_name = context["params"]["db_name"]
        user = context["params"]["user"]
        conn = Container().psycopg2_dbt_conn()
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(
            sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} TO {};").format(sql.Identifier(db_name), sql.Identifier(user))
        )
        cur.execute(sql.SQL("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {};").format(sql.Identifier(user)))
        cur.close()

    @task.python
    def delete_backup_if_exists_after(extracted_file_path):
        if os.path.exists(local_backup_path):
            os.remove(local_backup_path)
        if os.path.exists(extracted_file_path):
            os.remove(extracted_file_path)

    check_db_name = check_db_name_is_valid_identifier()
    db_does_not_exists = check_db_name_does_not_exist()
    url = get_download_url()
    delete_before = delete_backup_if_exists_before()
    download = download_backup(url)
    extract = extract_backup()
    extracted_file_path = get_extracted_backup_path()
    create = create_db()
    restore = restore_db(extracted_file_path)
    delete_after = delete_backup_if_exists_after(extracted_file_path)
    grant_permission = grant_permission_to_user()

    (
        check_db_name
        >> db_does_not_exists
        >> url
        >> delete_before
        >> download
        >> extract
        >> create
        >> restore
        >> grant_permission
        >> delete_after
    )


provision_dev_db()

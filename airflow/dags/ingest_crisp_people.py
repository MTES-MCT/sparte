"""
DAG pour ingérer les données utilisateurs de Crisp.

Récupère les profils utilisateurs, conversations et statistiques depuis l'API Crisp.
"""

import csv
import json
from datetime import datetime as dt
from datetime import timezone

from include.container import DomainContainer, InfraContainer
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime

from airflow.decorators import dag, task


def write_csv_and_upload(rows, fieldnames, tmp_filename, bucket_name, s3_key):
    """Helper pour écrire un CSV et l'uploader sur S3."""
    if not rows:
        return

    s3_handler = DomainContainer().s3_handler()
    tmp_path_generator = DomainContainer().tmp_path_generator()

    tmp_file_path = tmp_path_generator.get_tmp_path(tmp_filename)
    with open(tmp_file_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    s3_handler.upload_file(
        local_file_path=tmp_file_path,
        s3_bucket=bucket_name,
        s3_key=s3_key,
    )
    print(f"Uploaded {len(rows)} rows to s3://{bucket_name}/{s3_key}")


@dag(
    start_date=datetime(2026, 1, 27),
    schedule="@daily",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["CRISP"],
)
def ingest_crisp_people():  # noqa: C901
    bucket_name = InfraContainer().bucket_name()

    # S3 keys
    s3_keys = {
        "people": "crisp/people.csv",
        "people_stats": "crisp/people_stats.csv",
        "conversations": "crisp/conversations.csv",
        "conversation_messages": "crisp/conversation_messages.csv",
        "conversation_pages": "crisp/conversation_pages.csv",
        "conversation_events": "crisp/conversation_events.csv",
    }

    @task.python
    def fetch_people() -> str:
        """Récupère les profils utilisateurs."""
        crisp = InfraContainer().crisp()
        profiles = crisp.get_all_people_profiles()

        if not profiles:
            print("Aucun profil trouvé")
            return s3_keys["people"]

        rows = []
        for p in profiles:
            company = p.get("company") or {}
            segments = p.get("segments") or []
            rows.append(
                {
                    "people_id": p.get("people_id"),
                    "email": p.get("email"),
                    "nickname": p.get("nickname"),
                    "avatar": p.get("avatar"),
                    "gender": p.get("gender"),
                    "phone": p.get("phone"),
                    "address": p.get("address"),
                    "city": p.get("city"),
                    "country": p.get("country"),
                    "company_name": company.get("name"),
                    "company_url": company.get("url"),
                    "segments": ",".join(segments) if segments else None,
                    "created_at": p.get("created_at"),
                    "updated_at": p.get("updated_at"),
                }
            )

        write_csv_and_upload(rows, rows[0].keys(), "crisp_people.csv", bucket_name, s3_keys["people"])
        return s3_keys["people"]

    @task.python
    def fetch_people_stats() -> str:
        """Récupère les statistiques des personnes."""
        crisp = InfraContainer().crisp()
        stats = crisp.get_people_stats()

        if not stats:
            print("Aucune statistique trouvée")
            return s3_keys["people_stats"]

        row = {
            "total": stats.get("total"),
            "segments": json.dumps(stats.get("segments", [])),
            "fetched_at": dt.now(timezone.utc).isoformat(),
        }

        write_csv_and_upload([row], row.keys(), "crisp_people_stats.csv", bucket_name, s3_keys["people_stats"])
        return s3_keys["people_stats"]

    @task.python
    def fetch_conversations() -> str:
        """Récupère les conversations."""
        crisp = InfraContainer().crisp()
        conversations = crisp.get_all_conversations()

        if not conversations:
            print("Aucune conversation trouvée")
            return s3_keys["conversations"]

        rows = [
            {
                "session_id": c.get("session_id"),
                "inbox_id": c.get("inbox_id"),
                "created_at": c.get("created_at"),
                "updated_at": c.get("updated_at"),
                "is_verified": c.get("is_verified"),
                "is_blocked": c.get("is_blocked"),
                "availability": c.get("availability"),
                "state": c.get("state"),
                "status": c.get("status"),
                "active": c.get("active"),
            }
            for c in conversations
        ]

        write_csv_and_upload(rows, rows[0].keys(), "crisp_conversations.csv", bucket_name, s3_keys["conversations"])
        return s3_keys["conversations"]

    @task.python
    def fetch_conversation_messages() -> str:
        """Récupère les messages de toutes les conversations."""
        crisp = InfraContainer().crisp()
        messages = crisp.get_all_conversation_messages()

        if not messages:
            print("Aucun message trouvé")
            return s3_keys["conversation_messages"]

        rows = []
        for m in messages:
            user = m.get("user") or {}
            rows.append(
                {
                    "session_id": m.get("session_id"),
                    "fingerprint": m.get("fingerprint"),
                    "type": m.get("type"),
                    "origin": m.get("origin"),
                    "content": m.get("content"),
                    "read": m.get("read"),
                    "delivered": m.get("delivered"),
                    "timestamp": m.get("timestamp"),
                    "user_id": user.get("user_id"),
                    "from_type": m.get("from"),
                }
            )

        write_csv_and_upload(
            rows, rows[0].keys(), "crisp_conversation_messages.csv", bucket_name, s3_keys["conversation_messages"]
        )
        return s3_keys["conversation_messages"]

    @task.python
    def fetch_conversation_pages() -> str:
        """Récupère les pages visitées de toutes les conversations."""
        crisp = InfraContainer().crisp()
        pages = crisp.get_all_conversation_pages()

        if not pages:
            print("Aucune page trouvée")
            return s3_keys["conversation_pages"]

        rows = [
            {
                "session_id": p.get("session_id"),
                "page_title": p.get("page_title"),
                "page_url": p.get("page_url"),
                "page_referrer": p.get("page_referrer"),
                "timestamp": p.get("timestamp"),
            }
            for p in pages
        ]

        write_csv_and_upload(
            rows, rows[0].keys(), "crisp_conversation_pages.csv", bucket_name, s3_keys["conversation_pages"]
        )
        return s3_keys["conversation_pages"]

    @task.python
    def fetch_conversation_events() -> str:
        """Récupère les événements de toutes les conversations."""
        crisp = InfraContainer().crisp()
        events = crisp.get_all_conversation_events()

        if not events:
            print("Aucun événement trouvé")
            return s3_keys["conversation_events"]

        rows = [
            {
                "session_id": e.get("session_id"),
                "text": e.get("text"),
                "data": json.dumps(e.get("data")) if e.get("data") else None,
                "color": e.get("color"),
                "timestamp": e.get("timestamp"),
            }
            for e in events
        ]

        write_csv_and_upload(
            rows, rows[0].keys(), "crisp_conversation_events.csv", bucket_name, s3_keys["conversation_events"]
        )
        return s3_keys["conversation_events"]

    @task.python
    def ingest_to_db(table_name: str, s3_key: str) -> int | None:
        """Ingère un CSV depuis S3 vers une table."""
        return (
            DomainContainer()
            .s3_csv_file_to_db_table_handler()
            .ingest_s3_csv_file_to_db_table(
                s3_bucket=bucket_name,
                s3_key=s3_key,
                table_name=table_name,
                separator=",",
            )
        )

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s tag:crisp")

    # Fetch tasks
    people = fetch_people()
    people_stats = fetch_people_stats()
    conversations = fetch_conversations()
    messages = fetch_conversation_messages()
    pages = fetch_conversation_pages()
    events = fetch_conversation_events()

    # Ingest tasks
    ingest_people = ingest_to_db.override(task_id="ingest_people")("crisp_people", s3_keys["people"])
    ingest_stats = ingest_to_db.override(task_id="ingest_stats")("crisp_people_stats", s3_keys["people_stats"])
    ingest_convs = ingest_to_db.override(task_id="ingest_conversations")(
        "crisp_conversations", s3_keys["conversations"]
    )
    ingest_msgs = ingest_to_db.override(task_id="ingest_messages")(
        "crisp_conversation_messages", s3_keys["conversation_messages"]
    )
    ingest_pages = ingest_to_db.override(task_id="ingest_pages")(
        "crisp_conversation_pages", s3_keys["conversation_pages"]
    )
    ingest_events = ingest_to_db.override(task_id="ingest_events")(
        "crisp_conversation_events", s3_keys["conversation_events"]
    )

    dbt = dbt_build()

    # Dependencies
    people >> ingest_people >> dbt
    people_stats >> ingest_stats >> dbt
    conversations >> ingest_convs >> dbt
    messages >> ingest_msgs >> dbt
    pages >> ingest_pages >> dbt
    events >> ingest_events >> dbt


ingest_crisp_people()

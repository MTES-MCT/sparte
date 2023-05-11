from django.core.management.base import BaseCommand

from project.models import Project


class Command(BaseCommand):
    help = "Get complete history diff of projects"

    def add_arguments(self, parser):
        parser.add_argument("project_id", nargs="+", type=int, help="projects' id")

    def handle(self, *args, **options):
        for project_id in options["project_id"]:
            self.print_diff(Project.objects.get(pk=project_id))

    def print_diff(self, project):
        old_record = None
        for record in project.history.order_by("history_date").all():
            if old_record:
                print(f"{old_record.history_date:%Y-%m-%d %H:%M:%S} to {record.history_date:%Y-%m-%d %H:%M:%S}")
                print(f"change reason: {record.history_change_reason}")
                delta = record.diff_against(old_record)
                for change in delta.changes:
                    print("    `{}` changed from '{}' to '{}'".format(change.field, change.old, change.new))
            old_record = record

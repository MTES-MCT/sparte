from unittest import mock

from django.test import TestCase, override_settings

from project.api_views.ExportStartView import _run_export_job
from project.models import ExportJob
from users.models import User


class ExportServerTokenTests(TestCase):
    def setUp(self) -> None:
        user = User.objects.create_user(email="test@test.com", password="testpass123", first_name="T", last_name="U")
        self.job = ExportJob.objects.create(
            user=user, land_type="COMM", land_id="12345", report_type="rapport-complet"
        )

    def run_job(self) -> mock.MagicMock:
        with mock.patch("project.api_views.ExportStartView.requests.get") as get:
            get.return_value = mock.Mock(status_code=500, content=b"")
            _run_export_job(self.job.pk, "http://export", "http://page", "http://header", "http://footer")
        return get

    @override_settings(EXPORT_SERVER_TOKEN="secret-token")
    def test_sends_token_header_when_configured(self) -> None:
        get = self.run_job()

        self.assertEqual(get.call_args.kwargs["headers"], {"X-Export-Token": "secret-token"})

    @override_settings(EXPORT_SERVER_TOKEN="")
    def test_sends_no_token_header_by_default(self) -> None:
        get = self.run_job()

        self.assertEqual(get.call_args.kwargs["headers"], {})

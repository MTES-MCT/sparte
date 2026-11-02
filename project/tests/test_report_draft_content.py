from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from project.html_sanitizer import sanitize_html
from project.models import ReportDraft
from users.models import User

XSS_PAYLOAD = "<img src=x onerror=alert(document.domain)>"


class SanitizeHtmlTests(SimpleTestCase):
    def test_keeps_editor_markup(self) -> None:
        html = (
            "<p>Texte <strong>gras</strong> et <em>italique</em></p>"
            "<ul><li><p>un</p></li></ul><ol><li><p>deux</p></li></ol>"
        )

        self.assertEqual(sanitize_html(html), html)

    def test_removes_scripts_and_event_handlers(self) -> None:
        self.assertEqual(sanitize_html(XSS_PAYLOAD), "")
        self.assertEqual(sanitize_html("<script>alert(1)</script><p>ok</p>"), "<p>ok</p>")
        self.assertEqual(sanitize_html('<p onclick="alert(1)">a</p>'), "<p>a</p>")
        self.assertEqual(sanitize_html('<a href="javascript:alert(1)">lien</a>'), "lien")
        self.assertEqual(sanitize_html("<svg><script>alert(1)</script></svg>x"), "x")

    def test_escapes_text_and_closes_open_tags(self) -> None:
        self.assertEqual(sanitize_html("<p>1 &lt; 2 &amp; 3"), "<p>1 &lt; 2 &amp; 3</p>")
        self.assertEqual(sanitize_html("<<script>script>alert(1)<</script>/script>"), "&lt;/script&gt;")


class ReportDraftContentApiTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            email="test@test.com", password="testpass123", first_name="Test", last_name="User"
        )
        self.draft = ReportDraft.objects.create(
            user=self.user, report_type="rapport-complet", name="Mon rapport", land_type="COMM", land_id="12345"
        )
        self.client.force_login(self.user)
        self.url = reverse("api:report-draft-detail", kwargs={"pk": self.draft.id})

    def test_patch_stores_sanitized_content(self) -> None:
        response = self.client.patch(
            self.url,
            {"content": {"consommation_raison_evolutions": f"<p>Avant</p>{XSS_PAYLOAD}"}},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.content, {"consommation_raison_evolutions": "<p>Avant</p>"})

    def test_patch_rejects_non_string_zone(self) -> None:
        response = self.client.patch(
            self.url, {"content": {"zone": {"html": XSS_PAYLOAD}}}, content_type="application/json"
        )

        self.assertEqual(response.status_code, 400)

from django.test import TestCase, Client
from django.urls import reverse
from project.models import Project
from django.contrib.auth import get_user_model

class AddLookALikeHTMXTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='testuser', password='testpass')
        self.project = Project.objects.create(user=self.user, name="Projet Test")
        self.client = Client()
        self.client.login(username='testuser', password='testpass')

    def test_add_lookalike_htmx_returns_fragment(self):
        url = reverse('project:lookalike', args=[self.project.id])
        response = self.client.get(url, HTTP_HX_REQUEST='true')
        self.assertEqual(response.status_code, 200)
        # On vérifie que le fragment HTML du formulaire est bien présent
        self.assertIn('id="lookalike_form_target"', response.content.decode())
        # On vérifie qu'on n'a pas le HTML complet d'une page
        self.assertNotIn('<html', response.content.decode())

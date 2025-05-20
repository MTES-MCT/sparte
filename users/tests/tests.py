from django.core.exceptions import ValidationError
from django.test import TestCase

from users.models import User


class TestUsers(TestCase):
    def test_user_with_the_same_email_cannot_be_created(self):
        def create_two_users_with_same_email():
            User.objects.create_user(email="test@gmail.com")
            User.objects.create_user(email="test@gmail.com")

        with self.assertRaises(ValidationError):
            create_two_users_with_same_email()

    def test_user_with_the_same_email_but_different_casing_cannot_be_created(self):
        def create_two_users_with_same_email_but_different_casing():
            User.objects.create_user(email="test@gmail.com")
            User.objects.create_user(email="TEST@gmail.com")

        with self.assertRaises(ValidationError):
            create_two_users_with_same_email_but_different_casing()

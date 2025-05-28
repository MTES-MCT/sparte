from django.shortcuts import redirect
from django.urls import reverse


class ProfileCompletionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method != "GET":
            return self.get_response(request)

        # Liste des URL à exclure de la vérification
        excluded_urls = [
            reverse("users:complete_profile"),
            reverse("users:signin"),
            reverse("users:signup"),
            reverse("users:signout"),
            "/admin/",
            "/public/",
            "/api/",
        ]

        # Vérifier si l'utilisateur est connecté et si son profil est incomplet
        if (
            request.user.is_authenticated
            and not request.user.is_profile_complete
            and not any(request.path.startswith(url) for url in excluded_urls)
        ):
            # Conserver l'URL complète avec tous les paramètres
            next_url = request.get_full_path()
            return redirect(f"{reverse('users:complete_profile')}?next={next_url}")

        return self.get_response(request)

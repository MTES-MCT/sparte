from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils import timezone

from project.models import Request, RNUPackage, RNUPackageRequest
from users.models import User


@login_required
def download_package_request(request: Request, departement: str) -> HttpResponse:
    rnu_package = RNUPackage.objects.get(departement_official_id=departement)
    user: User = request.user
    RNUPackageRequest.objects.create(
        user=request.user,
        rnu_package=rnu_package,
        departement_official_id=rnu_package.departement_official_id,
        email=user.email,
        requested_at=timezone.now(),
        requested_diagnostics_before_package_request=user.request_set.filter(done=True).count(),
        account_created_for_package=user.created_today,
    )
    return redirect(rnu_package.file.url)

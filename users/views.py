from django.http import HttpResponseRedirect
from django.shortcuts import render

from .forms import SignupForm


def signup(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():

            return HttpResponseRedirect("/")
    else:
        form = SignupForm()
    return render(request, "users/signup.html", {"form": form})

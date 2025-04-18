from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView
from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import redirect, render
from django.contrib import messages
from accounts.forms.UserSignUpForm import UserSignUpForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .forms import UserUpdateForm
from django.contrib.auth import logout
from accounts.forms.UserUpdateForm import UserUpdateForm
from django.contrib.auth import login, logout



class UserUpdateView(UserPassesTestMixin, UpdateView):
    model = User
    form_class = UserUpdateForm
    success_url = reverse_lazy("accounts:user-profile")
    template_name = "user/update.html"

    def test_func(self):
        pkInURL = self.kwargs['pk']
        return self.request.user.is_authenticated and self.request.user.id == pkInURL or self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(
            self.request,
            "Vous n'avez pas l'autorisation d'accéder à cette page!")
        return redirect('accounts:user-profile')


class UserSignUpView(UserPassesTestMixin, CreateView):
    form_class = UserSignUpForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

    def test_func(self):
        return self.request.user.is_anonymous or self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Vous êtes déjà inscrit!")
        return redirect('home')


@login_required
def profile(request):
    languages = {
        "fr": "Français",
        "en": "English",
        "nl": "Nederlands",
    }

    return render(request, 'user/profile.html', {
        "user_language": languages[request.user.usermeta.langue],
    })


@login_required
def delete(request, pk):
    if request.method == 'POST':
        user = User.objects.get(id=pk)
        user.delete()

        logout(request)
        return redirect('home')

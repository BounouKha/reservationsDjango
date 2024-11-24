from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView
from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import redirect
from django.contrib import messages
from django.shortcuts import render
from catalogue.models import UserMeta
from .forms.UserSignUpForm import UserSignUpForm
from .forms.UserUpdateForm import UserUpdateForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User




class UserSignUpView(UserPassesTestMixin, CreateView):
    form_class = UserSignUpForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

    def test_func(self):
        return (self.request.user.is_anonymous or self.request.user.is_superuser)

    def handle_no_permission(self):
        messages.error(self.request, "Vous êtes déjà inscrit!")
        return redirect('home')

class UserUpdateView(UserPassesTestMixin, UpdateView):
    model = User
    form_class = UserUpdateForm
    success_url = reverse_lazy("accounts:user-profile")
    template_name = "user/update.html"

    def test_func(self):
        pkInURL = self.kwargs['pk']
        return self.request.user.is_authenticated and self.request.user.id==pkInURL or self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Vous n'avez pas l'autorisation d'accéder à cette page!")
        return redirect('accounts:user-profile')

@login_required
def profile(request):
    languages = {
        "fr": "Français",
        "en": "English",
        "nl": "Nederlands",
    }

    if not hasattr(request.user, 'meta'):
        user_meta = UserMeta.objects.create(user=request.user, langue='')  # Valeur par défaut ''
    else:
        user_meta = request.user.meta

    return render(request, 'profile.html',{
        "user_language": languages.get(user_meta.langue, "Non défini"),  # Défaut en cas de langue non trouvée
})




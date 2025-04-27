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
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from catalogue.models.user_meta import UserMeta



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


def check_auth(request):
    return JsonResponse({"authenticated": True})


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"message": "Nom d'utilisateur et mot de passe requis."}, status=400)

        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            user_meta, _ = UserMeta.objects.get_or_create(user=user)
            user_meta.is_logged_in = True
            user_meta.active_token = token.key
            user_meta.save()

            return Response({
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                }
            })
        else:
            return Response({"message": "Nom d'utilisateur ou mot de passe incorrect."}, status=401)

class LogoutView(APIView):
    def post(self, request):
        user = request.user
        if user.is_authenticated:
            Token.objects.filter(user=user).delete()
            user_meta = UserMeta.objects.get(user=user)
            user_meta.is_logged_in = False
            user_meta.active_token = None
            user_meta.save()
            return Response({"message": "Déconnexion réussie."})
        return Response({"message": "Utilisateur non authentifié."}, status=401)

class UserMetaDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response({"error": "Non autorisé."}, status=403)

        user_meta = get_object_or_404(UserMeta, user=request.user)
        return Response({
            "user": {
                "id": user_meta.user.id,
                "username": user_meta.user.username,
                "first_name": user_meta.user.first_name,
                "last_name": user_meta.user.last_name,
                "email": user_meta.user.email,
            },
            "is_logged_in": user_meta.is_logged_in,
        })
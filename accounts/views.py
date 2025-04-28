from urllib import request
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView
from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import redirect, render
from django.contrib import messages
from accounts.forms.UserSignUpForm import UserSignUpForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

from catalogue.models.cart import Cart, CartItem
from catalogue.models.price import Price
from catalogue.models.representation import Representation
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
    

class UserCartView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request, user_id):
    # Vérifiez si l'utilisateur connecté correspond à l'ID utilisateur dans l'URL
        if request.user.id != user_id:
            return Response({"error": "Non autorisé."}, status=403)

        # Récupérez le panier de l'utilisateur
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            print(f"Aucun panier trouvé pour l'utilisateur {request.user.id}")
            return Response({"items": []})  # Panier vide si aucun panier n'existe

        # Construire la réponse avec les relations appropriées
        return Response({
            "id": cart.id,
            "items": [
                {
                    "id": item.id,
                    "title": item.representation.show.title,  # Titre du spectacle
                    "schedule": item.representation.schedule,  # Horaire
                    "location": item.representation.location.designation,  # Lieu
                    "quantity": item.quantity,  # Quantité
                    "price": {
                        "type": item.price.type,  # Type de billet
                        "amount": str(item.price.price),  # Prix du billet
                    },
                }
                for item in cart.items.select_related('representation__show', 'representation__location', 'price').all()
            ],
        })
        
    def post(self, request, user_id):
        try:
            data = request.data
            print(f"Données reçues : {data}")

            # Extraire les informations nécessaires
            representation_data = data.get('id', {})
            representation_id = representation_data.get('id')  # ID de la représentation
            quantities = representation_data.get('quantities', [])  # Liste des quantités par type

            if not representation_id or not quantities:
                return Response({"error": "Données invalides. 'id' et 'quantities' sont requis."}, status=400)

            # Vérifier que la représentation existe
            representation = Representation.objects.filter(id=representation_id).first()
            if not representation:
                return Response({"error": f"Représentation introuvable pour l'ID {representation_id}."}, status=404)

            # Récupérez ou créez le panier de l'utilisateur
            cart, created = Cart.objects.get_or_create(user=request.user)

            # Parcourez les quantités et ajoutez chaque type au panier
            for quantity in quantities:
                # Trouver le prix correspondant au type et au montant
                price = Price.objects.filter(type=quantity['type'], price=quantity['price']).first()
                if not price:
                    return Response({"error": f"Prix introuvable pour le type {quantity['type']} et le prix {quantity['price']}."}, status=400)

                # Ajouter ou mettre à jour l'article dans le panier
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    representation=representation,
                    price=price,  # Utiliser le champ price
                    defaults={'quantity': quantity['count']}
                )
                if not created:
                    cart_item.quantity += quantity['count']
                    cart_item.save()

            return Response({"message": "Articles ajoutés au panier avec succès !", "cart_id": cart.id})
        except Exception as e:
            print(f"Erreur : {e}")
            return Response({"error": str(e)}, status=400)
        

class UpdateCartItemView(APIView):
    authentication_classes = [TokenAuthentication]

    def patch(self, request):
        try:
            cart_item_id = request.data.get('cart_item_id')
            quantity = request.data.get('quantity')

            if not cart_item_id or quantity is None:
                return Response({"error": "Données invalides."}, status=400)

            # Vérifier que l'article appartient au panier de l'utilisateur
            cart_item = CartItem.objects.filter(id=cart_item_id, cart__user=request.user).first()
            if not cart_item:
                return Response({"error": "Article introuvable ou non autorisé."}, status=404)

            # Mettre à jour la quantité
            if quantity > 0:
                cart_item.quantity = quantity
                cart_item.save()
            else:
                # Supprimer l'article si la quantité est 0
                cart_item.delete()

            # Retourner le panier mis à jour
            cart = cart_item.cart
            items = cart.items.select_related('representation__show', 'price').all()
            cart_data = {
                "id": cart.id,
                "items": [
                    {
                        "id": item.id,
                        "title": item.representation.show.title,
                        "schedule": item.representation.schedule,
                        "location": item.representation.location.designation,
                        "price": {
                            "type": item.price.type,
                            "amount": str(item.price.price),
                        },
                        "quantity": item.quantity,
                    }
                    for item in items
                ],
            }
            return Response(cart_data)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
class DeleteCartItemView(APIView):
    authentication_classes = [TokenAuthentication]

    def delete(self, request, user_id):
        try:
            cart_item_id = request.data.get('cart_item_id')

            if not cart_item_id:
                return Response({"error": "ID de l'article manquant."}, status=400)

            # Vérifier que l'article appartient au panier de l'utilisateur
            cart_item = CartItem.objects.filter(id=cart_item_id, cart__user=request.user).first()
            if not cart_item:
                return Response({"error": "Article introuvable ou non autorisé."}, status=404)

            # Supprimer l'article
            cart_item.delete()

            # Retourner le panier mis à jour
            cart = cart_item.cart
            items = cart.items.select_related('representation__show', 'price').all()
            cart_data = {
                "id": cart.id,
                "items": [
                    {
                        "id": item.id,
                        "title": item.representation.show.title,
                        "schedule": item.representation.schedule,
                        "location": item.representation.location.designation,
                        "price": {
                            "type": item.price.type,
                            "amount": str(item.price.price),
                        },
                        "quantity": item.quantity,
                    }
                    for item in items
                ],
            }
            return Response(cart_data)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
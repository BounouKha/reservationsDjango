# filepath: c:\Users\khali\reservationsDjango\catalogue\scripts\signals.py
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from catalogue.models.cart import Cart, CartItem
from catalogue.models.show import Show

@receiver(user_logged_in)
def merge_cart_on_login(sender, request, user, **kwargs):
    # Récupérer le panier de la session
    session_cart = request.session.get("cart", {})

    if not session_cart:
        return  # Rien à fusionner si le panier de la session est vide

    # Récupérer ou créer le panier de l'utilisateur connecté
    cart, created = Cart.objects.get_or_create(user=user)

    for show_id, quantity in session_cart.items():
        try:
            show = Show.objects.get(id=show_id)
            # Vérifier si l'article existe déjà dans le panier
            cart_item, created = CartItem.objects.get_or_create(cart=cart, show=show)
            cart_item.quantity += quantity  # Ajouter la quantité
            cart_item.save()
        except Show.DoesNotExist:
            continue  # Ignorer les articles invalides

    # Vider le panier de la session après la fusion
    request.session["cart"] = {}
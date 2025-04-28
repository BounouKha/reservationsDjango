import stripe
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from catalogue.models.cart import Cart
from rest_framework.authentication import TokenAuthentication

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateStripeSessionView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        try:
            print("Début de la création de la session Stripe")
            cart = Cart.objects.filter(user=request.user).first()
            if not cart or not cart.items.exists():
                print("Le panier est vide")
                return JsonResponse({"error": "Le panier est vide."}, status=400)

            line_items = []
            for item in cart.items.select_related('price'):
                # Inclure la quantité, le titre et le type de prix dans le nom du produit
                product_name = f"x{item.quantity} {item.representation.show.title} - {item.price.type}"  # Ajout de la quantité
                print(f"Article : {product_name}, Prix : {item.price.price}, Quantité : {item.quantity}")

                line_items.append({
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': product_name,  # Nom du produit avec quantité, titre et type de prix
                        },
                        'unit_amount': int(item.price.price * 100),  # Convertir en centimes
                    },
                    'quantity': 1,  # Stripe gère la quantité dans le nom du produit
                })

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url='http://localhost:3000/success',
                cancel_url='http://localhost:3000/cancel',
            )
            print("Session Stripe créée avec succès :", session.id)
            return JsonResponse({'id': session.id})
        except Exception as e:
            print("Erreur lors de la création de la session Stripe :", str(e))
            return JsonResponse({"error": str(e)}, status=500)
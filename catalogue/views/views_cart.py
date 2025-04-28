import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from catalogue.models.cart import Cart, CartItem
from catalogue.models import Representation
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from catalogue.models.show import Show
from django.contrib.sessions.models import Session



@csrf_exempt
def add_to_cart(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=405)
    try:
        data = json.loads(request.body)
        repr_id       = data['representation_id']
        price_id      = data['price_id']        # nouveau champ
        qty           = int(data.get('quantity', 1))

        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                representation_id=repr_id,
                price_id=price_id,
                defaults={'quantity': qty}
            )
            if not created:
                item.quantity += qty
                item.save()
            return JsonResponse({"message": "Ajouté au panier"}, status=200)
        else:
            # Même logique dans les cookies ou session, en gérant price_id idem
            session_cart = request.session.get('cart', {})
            key = f"{repr_id}:{price_id}"
            session_cart[key] = session_cart.get(key, 0) + qty
            request.session['cart'] = session_cart
            return JsonResponse({"message": "Ajouté au panier (session)"}, status=200)

    except KeyError:
        return JsonResponse({"error": "Champs manquants"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    
def get_cart(request):
    print(f"Utilisateur authentifié : {request.user.is_authenticated}")
    if request.user.is_authenticated:
        # Utilisateur connecté
        try:
            cart = request.user.cart
            items = cart.items.select_related('representation__show').all()
            cart_data = {
                "id": cart.id,
                "items": [
                    {
                        "id": item.id,
                        "representation": {
                            "id": item.representation.id,
                            "schedule": item.representation.schedule,
                            "location": item.representation.location.designation,
                            "locality": item.representation.location.locality.locality,
                            "show": {
                                "id": item.representation.show.id,
                                "title": item.representation.show.title,
                                "description": item.representation.show.description,
                                "bookable": item.representation.show.bookable,
                                "duration": item.representation.show.duration,
                            }
                        },
                        "quantity": item.quantity,
                    }
                    for item in items
                ],
            }
            return JsonResponse(cart_data, safe=False)
        except Cart.DoesNotExist:
            return JsonResponse({"id": None, "items": []}, safe=False)
    else:
        # Utilisateur non connecté : récupérer le panier de la session
        session_cart = request.session.get("cart", {})
        cart_items = []
        for representation_id, quantity in session_cart.items():
            if not isinstance(representation_id, int) or not Representation.objects.filter(id=representation_id).exists():
                continue
            representation = Representation.objects.select_related('show', 'location__locality').get(id=representation_id)
            cart_items.append({
                "id": representation_id,
                "representation": {
                    "id": representation.id,
                    "schedule": representation.schedule,
                    "location": representation.location.designation,
                    "locality": representation.location.locality.locality,
                    "show": {
                        "id": representation.show.id,
                        "title": representation.show.title,
                        "description": representation.show.description,
                        "bookable": representation.show.bookable,
                        "duration": representation.show.duration,
                    }
                },
                "quantity": quantity,
            })

        cart_data = {
            "id": None,
            "items": cart_items,
        }
        return JsonResponse(cart_data, safe=False)
    


@csrf_exempt
def update_cart_item(request):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
            cart_item_id = data.get("cart_item_id")
            new_quantity = data.get("quantity")

            if new_quantity is None or new_quantity < 1:
                return JsonResponse({"error": "Invalid quantity."}, status=400)

            if request.user.is_authenticated:
                # Utilisateur connecté
                cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
                cart_item.quantity = new_quantity
                cart_item.save()
            else:
                # Utilisateur non connecté : mettre à jour dans la session
                session_cart = request.session.get("cart", {})
                if str(cart_item_id) in session_cart:
                    session_cart[str(cart_item_id)] = new_quantity
                    request.session["cart"] = session_cart
                else:
                    return JsonResponse({"error": "Item not found in session cart."}, status=404)

            return JsonResponse({"message": "Cart item updated successfully!"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method."}, status=405)


@csrf_exempt
def remove_cart_item(request):
    if request.method == "DELETE":
        try:
            data = json.loads(request.body)
            cart_item_id = data.get("cart_item_id")

            if request.user.is_authenticated:
                # Utilisateur connecté
                cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
                cart_item.delete()
            else:
                # Utilisateur non connecté : supprimer de la session
                session_cart = request.session.get("cart", {})
                if str(cart_item_id) in session_cart:
                    del session_cart[str(cart_item_id)]
                    request.session["cart"] = session_cart
                else:
                    return JsonResponse({"error": "Item not found in session cart."}, status=404)

            return JsonResponse({"message": "Cart item removed successfully!"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method."}, status=405)


from django.contrib.auth.decorators import login_required

@login_required
def merge_cart(request):
    try:
        cart_cookie = request.COOKIES.get('cart', '{}')
        cart_data = json.loads(cart_cookie)

        if cart_data:
            cart, created = Cart.objects.get_or_create(user=request.user)

            for representation_id, quantity in cart_data.items():
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    representation_id=representation_id,
                    defaults={'quantity': quantity}
                )
                if not created:
                    cart_item.quantity += quantity
                    cart_item.save()

        response = JsonResponse({"message": "Cart merged successfully!"})
        response.delete_cookie('cart')  # Supprimer les cookies après fusion
        return response

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from catalogue.models.cart import Cart, CartItem
from api.catalogue.serializers.cart_serializer import CartSerializer

class CartView(APIView):
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        data = request.data
        show_id = data.get('show')
        quantity = data.get('quantity', 1)

        # Add or update item in the cart
        item, created = CartItem.objects.get_or_create(cart=cart, show_id=show_id)
        if not created:
            item.quantity += quantity
        item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({"message": "Cart cleared"}, status=status.HTTP_204_NO_CONTENT)
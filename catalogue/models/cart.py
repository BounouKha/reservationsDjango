# catalogue/models/cart.py
from django.db import models
from catalogue.models import Representation, Price   # on importe Price, pas PriceType
from django.contrib.auth.models import User

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    representation = models.ForeignKey(Representation, on_delete=models.CASCADE)
    price = models.ForeignKey(Price, on_delete=models.CASCADE)  # ici Price
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'representation', 'price')

    def __str__(self):
        return (f"{self.quantity} x {self.price.name} @ {self.representation.show.title} "
                f"({self.representation.schedule}) in {self.cart.user.username}'s cart")

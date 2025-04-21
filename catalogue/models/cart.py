from django.db import models
from catalogue.models import Representation
from django.contrib.auth.models import User

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    representation = models.ForeignKey(Representation, on_delete=models.CASCADE)  # Lien avec Representation
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.representation.show.title} ({self.representation.schedule}) in {self.cart.user.username}'s cart"
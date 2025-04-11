from django.db import models
from .price import *
from .show import *

class ShowPrice(models.Model):
    price = models.ForeignKey(Price, on_delete=models.RESTRICT, null=False)
    show = models.ForeignKey(Show, on_delete=models.RESTRICT, null=False)

    def __str__(self):
        return f"{self.show.title} - {self.price.type} ({self.price.price}€)"
    
    class Meta:
        db_table = "show_prices"
        unique_together = ('show', 'price')  # Évite les doublons

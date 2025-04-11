from django.db import models
from .reservation import *
from .representation import *
from .price import *


class RepresentationReservation(models.Model):
    representation = models.ForeignKey(Representation, on_delete=models.CASCADE)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    price = models.ForeignKey(Price, on_delete=models.RESTRICT, null=True)
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.reservation.user} - {self.representation.show.title} - {self.quantity} places"
    
    class Meta:
        db_table = "representation_reservations"
        unique_together = ('representation', 'reservation', 'price') 
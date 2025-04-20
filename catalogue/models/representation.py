from django.db import models
from django.http import JsonResponse
from .show import *
from .location import *

class Representation(models.Model):
    show = models.ForeignKey(Show, on_delete=models.RESTRICT, null=False, related_name='representations')
    schedule = models.DateTimeField()
    location = models.ForeignKey(Location, on_delete=models.RESTRICT, null=True, related_name='representations')
    
    # Relation ManyToMany vers Reservation via RepresentationReservation
    reservations = models.ManyToManyField(
        'Reservation',
        through='RepresentationReservation',
        related_name='representations'
    )

    def __str__(self):
        return f"{self.show.slug} @ {self.schedule}"
    
    class Meta:
        db_table = "representations"

def representationList(request):
    representationList = Representation.objects.all().values(
        'id', 'schedule', 'location__designation', 'show__title',
        'show__artists__id', 'show__artists__firstname', 'show__artists__lastname'
    )
    
    # Regrouper les artistes par représentation
    grouped_representations = {}
    for representation in representationList:
        rep_id = representation['id']
        if rep_id not in grouped_representations:
            grouped_representations[rep_id] = {
                'id': rep_id,
                'schedule': representation['schedule'],
                'location': representation['location__designation'],
                'show': {
                    'title': representation['show__title'],
                    'artists': []
                }
            }
        grouped_representations[rep_id]['show']['artists'].append({
            'id': representation['show__artists__id'],
            'firstname': representation['show__artists__firstname'],
            'lastname': representation['show__artists__lastname']
        })
    
    return JsonResponse(list(grouped_representations.values()), safe=False)
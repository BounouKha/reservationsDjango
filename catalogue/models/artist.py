from django.db import models
from .type import *
from django.http import JsonResponse
from .show import Show  


class ArtistManager(models.Manager):
    def get_by_natural_key(self, firstname, lastname):
        return self.get(firstname=firstname, lastname=lastname)

class Artist(models.Model):
    firstname = models.CharField(max_length=60)
    lastname = models.CharField(max_length=60)
    shows = models.ManyToManyField(Show, related_name='artists', through='ArtistShow')  # Ajout de la relation Many-to-Many
    

    objects = ArtistManager()

    def __str__(self):
        return self.firstname +" "+ self.lastname
    
    class Meta:
        db_table = "artists"
        managed = False
        constraints = [
            models.UniqueConstraint(
                fields=["firstname", "lastname"],
                name="unique_firstname_lastname",
            ),
        ]

    def natural_key(self):
        return (self.firstname, self.lastname)

def artist_list(request):
    artists = Artist.objects.all().values('id', 'firstname', 'lastname')
    return JsonResponse(list(Artist), safe=False)
from django.db import models
from .artist import Artist
from .show import Show

class ArtistShow(models.Model):
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    show = models.ForeignKey(Show, on_delete=models.CASCADE)


    class Meta:
        db_table = "artist_show"
        unique_together = ("artist", "show")  # Contrainte d'unicité
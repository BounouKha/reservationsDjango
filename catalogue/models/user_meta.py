from django.contrib.auth.models import User
from django.db import models


class Language(models.TextChoices):
    NONE = "", "Choisissez votre langue"
    FRENCH = "fr", "Français"
    ENGLISH = "en", "English"
    DUTCH = "nl", "Nederlands"


class UserMeta(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="meta")
    langue = models.CharField(
        max_length=2,
        choices=Language.choices,
        default=Language.NONE
    )

    def __str__(self):
        # Afficher un nom d'utilisateur fallback si prénom/nom est vide
        full_name = f"{self.user.first_name} {self.user.last_name}".strip()
        return full_name if full_name else self.user.username

    class Meta:
        db_table = "user_meta"

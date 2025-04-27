from django.contrib.auth.models import User
from django.http import JsonResponse
from django.db import models


class UserMeta(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    langue = models.CharField(max_length=2)
    active_token = models.CharField(max_length=255, blank=True, null=True)
    is_logged_in = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {'Connecté' if self.is_logged_in else 'Déconnecté'}"

    class Meta:
        db_table = "user_meta"

        
def user_meta_list(request):
    user_meta = UserMeta.objects.all().values(
        'id', 'user__username', 'user__first_name', 'user__last_name', 'langue'
    )
    return JsonResponse(list(user_meta), safe=False)
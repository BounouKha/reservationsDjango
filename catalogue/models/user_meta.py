from django.contrib.auth.models import User
from django.http import JsonResponse
from django.db import models


class UserMeta(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    langue = models.CharField(max_length=2)

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name

    class Meta:
        db_table = "user_meta"

        
def user_meta_list(request):
    user_meta = UserMeta.objects.all().values('id', 'user__username', 'langue')
    return JsonResponse(list(user_meta), safe=False)
from django.http import JsonResponse
from catalogue.models import UserMeta

def user_meta_list(request):
    user_meta = UserMeta.objects.all().values('id', 'user__first_name', 'user__last_name' , 'langue')
    return JsonResponse(list(user_meta), safe=False)
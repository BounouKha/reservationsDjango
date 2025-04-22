from django.shortcuts import render
from django.http import Http404
from rest_framework.generics import ListAPIView, RetrieveAPIView
from catalogue.models.serializers import ShowSerializer
from catalogue.models import Show

def index(request):
    shows = Show.objects.all()
    title = 'Liste des spectacles'
    
    return render(request, 'show/index.html', {
        'shows':shows,
        'title':title
    })

def show(request, show_id):
    try:
        show = Show.objects.get(id=show_id)
    except Show.DoesNotExist:
        raise Http404('Spectacle inexistant');
        
    title = "Fiche d'un spectacle"
    
    return render(request, 'show/show.html', {
        'show':show,
        'title':title 
    })


# Vue pour la liste des spectacles
class ShowListAPIView(ListAPIView):
    queryset = Show.objects.prefetch_related('showprice_set__price').all()  # Précharger les prix et leurs types
    serializer_class = ShowSerializer

# Vue pour les détails d'un spectacle
class ShowDetailAPIView(RetrieveAPIView):
    queryset = Show.objects.prefetch_related('showprice_set__price').all()  # Précharger les prix et leurs types
    serializer_class = ShowSerializer
    lookup_field = 'id'  # Utiliser l'ID pour récupérer un spectacle spécifique
    

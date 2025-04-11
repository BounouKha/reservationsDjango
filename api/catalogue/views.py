from rest_framework.permissions import DjangoModelPermissions
from rest_framework import generics
from catalogue.models import Artist
from catalogue.models.serializers import ArtistSerializer

class ArtistListCreateView(generics.ListCreateAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [DjangoModelPermissions]

class ArtistRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [DjangoModelPermissions]
    

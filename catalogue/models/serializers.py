from rest_framework import serializers
from catalogue.models import Artist
from rest_framework.reverse import reverse
from catalogue.models import Show, ShowPrice, Price
from catalogue.models.reservation import Reservation

class ArtistSerializer(serializers.HyperlinkedModelSerializer):
    links = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = ['id', 'firstname', 'lastname', 'links']

    def get_links(self, obj):
        request = self.context.get('request')
        return {
            'self': reverse('catalogue:artist-detail', kwargs={'pk': obj.id}, request=request),
            'all_artists': reverse('catalogue:artist-list', request=request),
        }


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ['type', 'price']  # Inclure le type et le montant

class ShowPriceSerializer(serializers.ModelSerializer):
    price = PriceSerializer()  # Inclure les détails du prix

    class Meta:
        model = ShowPrice
        fields = ['price']  # Inclure uniquement le prix

class ShowSerializer(serializers.ModelSerializer):
    prices = ShowPriceSerializer(many=True, source='showprice_set')  # Inclure les prix associés

    class Meta:
        model = Show
        fields = ['id', 'title', 'description', 'duration', 'bookable', 'prices']
        

class ReservationSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ['id', 'booking_date', 'status', 'title', 'quantity']

    def get_title(self, obj):
        # Récupérer le titre du spectacle via RepresentationReservation
        representation_reservation = obj.representationreservation_set.first()
        if representation_reservation:
            return representation_reservation.representation.show.title
        return None

    def get_quantity(self, obj):
        # Récupérer la quantité via RepresentationReservation
        representation_reservation = obj.representationreservation_set.first()
        if representation_reservation:
            return representation_reservation.quantity
        return 0



class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ['id', 'type', 'price']  # Ajoutez les champs nécessaires
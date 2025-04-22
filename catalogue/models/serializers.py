from rest_framework import serializers
from catalogue.models import Artist
from rest_framework.reverse import reverse
from catalogue.models import Show, ShowPrice, Price

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
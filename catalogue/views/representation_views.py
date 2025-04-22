from django.http import JsonResponse
from catalogue.models import Representation

def representation_list(request):
    # Récupérer les représentations avec les relations nécessaires
    representationList = Representation.objects.select_related(
        'show', 'location__locality'
    ).prefetch_related(
        'show__artists', 'show__prices'
    ).all().values(
        'id',  # ID de la représentation
        'schedule',
        'location__designation',
        'location__locality__locality',
        'show__id',
        'show__title',
        'show__bookable',
        'show__duration',
        'show__description',
        'show__artists__id',
        'show__artists__firstname',
        'show__artists__lastname',
        'show__prices__type',
        'show__prices__price'
    )

    # Regrouper les artistes et les prix par représentation
    grouped_representations = {}
    for representation in representationList:
        rep_id = representation['id']  # Utilisez l'ID unique de la représentation comme clé
        if rep_id not in grouped_representations:
            grouped_representations[rep_id] = {
                'id': rep_id,
                'schedule': representation['schedule'],
                'location': representation.get('location__designation', 'Non spécifiée'),
                'locality': representation.get('location__locality__locality', 'Non spécifiée'),
                'show': {
                    'id': representation['show__id'],
                    'title': representation['show__title'],
                    'bookable': representation['show__bookable'],
                    'duration': representation['show__duration'],
                    'description': representation['show__description'],
                    'artists': [],
                    'prices': []
                }
            }
        # Ajouter les artistes sans doublons
        artist = {
            'id': representation['show__artists__id'],
            'firstname': representation['show__artists__firstname'],
            'lastname': representation['show__artists__lastname']
        }
        if artist not in grouped_representations[rep_id]['show']['artists']:
            grouped_representations[rep_id]['show']['artists'].append(artist)

        # Ajouter les prix sans doublons
        price = {
            'type': representation['show__prices__type'],
            'price': representation['show__prices__price']
        }
        if price not in grouped_representations[rep_id]['show']['prices']:
            grouped_representations[rep_id]['show']['prices'].append(price)

    # Retourner les données regroupées sous forme de JSON
    return JsonResponse(list(grouped_representations.values()), safe=False)
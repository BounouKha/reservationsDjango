from django.http import JsonResponse
from catalogue.models import Representation

def representation_list(request):
    representationList = Representation.objects.select_related('show', 'location__locality').prefetch_related('show__artists').all().values(
        'id',  # Ajoutez l'ID de la représentation pour une clé unique
        'schedule',
        'location__designation',
        'location__locality__locality',
        'show__title',
        'show__bookable',
        'show__duration',
        'show__description',
        'show__artists__id',
        'show__artists__firstname',
        'show__artists__lastname'
    )

    # Regrouper les artistes par représentation
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
                    'title': representation['show__title'],
                    'bookable': representation['show__bookable'],
                    'duration': representation['show__duration'],
                    'description': representation['show__description'],
                    'artists': []
                }
            }
        grouped_representations[rep_id]['show']['artists'].append({
            'id': representation['show__artists__id'],
            'firstname': representation['show__artists__firstname'],
            'lastname': representation['show__artists__lastname']
        })

    return JsonResponse(list(grouped_representations.values()), safe=False)
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import api_view
from catalogue.models import Artist

@api_view(['GET'])
def artist_list(request):
    all_artists = request.query_params.get('all', 'false').lower() == 'true'
    if all_artists:
        artists = Artist.objects.all()
    else:
        paginator = PageNumberPagination()
        paginator.page_size = 30
        artists = paginator.paginate_queryset(Artist.objects.all(), request)
        return paginator.get_paginated_response([
            {"id": artist.id, "firstname": artist.firstname, "lastname": artist.lastname}
            for artist in artists
        ])
    return Response([
        {"id": artist.id, "firstname": artist.firstname, "lastname": artist.lastname}
        for artist in artists
    ])
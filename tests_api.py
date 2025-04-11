from rest_framework.test import APITestCase
from rest_framework import status
from catalogue.models import Artist

class ArtistAPITests(APITestCase):
    def test_create_artist(self):
        data = {'firstname': 'John', 'lastname': 'Doe'}
        response = self.client.post('/catalogue/api/artists/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_artist_list(self):
        Artist.objects.create(firstname='Jane', lastname='Smith')
        response = self.client.get('/catalogue/api/artists/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

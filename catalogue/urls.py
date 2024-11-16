# Register your models here.
from django.urls import path
from django.contrib import admin
from .models import Artist
admin.site.register(Artist)

from . import views

app_name='catalogue'

urlpatterns = [
    path('artist/', views.artist.index, name='artist-index'),
    path('artist/<int:artist_id>', views.artist.show, name='artist-show'),
    path('artist/edit/<int:artist_id>', views.artist.edit, name='artist-edit'),
    path('artist/create', views.artist.create, name='artist-create'),
    path('artist/delete/<int:artist_id>', views.artist.delete, name='artist-delete'),
]

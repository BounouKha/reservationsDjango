"""reservations.catalogue URL Configuration
"""
from django.urls import path, include

from accounts.views import UserMetaDetailView
from catalogue.views.stripe import CreateStripeSessionView
from catalogue.views.views_cart import add_to_cart, get_cart, remove_cart_item, update_cart_item
from . import views
from django.contrib import admin
from api.catalogue.views.views import ArtistListCreateView, ArtistRetrieveUpdateDestroyView
from catalogue.views.show_views import show_detail
from catalogue.models.feeds import BookableShowFeed 
from catalogue.views.user_meta_views import user_meta_list
from catalogue.views.artist_views import artist_list
from catalogue.views.representation_views import representation_list
from catalogue.views.show_ import ShowListAPIView, ShowDetailAPIView



app_name = 'catalogue'

urlpatterns = [

    path('artist/', views.artist.index, name='artist-index'),
    path('artist/<int:artist_id>', views.artist.show, name='artist-show'),
    path('artist/edit/<int:artist_id>', views.artist.edit, name='artist-edit'),
    path('artist/create', views.artist.create, name='artist-create'),
    path(
        'artist/delete/<int:artist_id>/',
        views.artist.delete,
        name='artist-delete'),
    path('admin/', admin.site.urls),
    path('type/', views.type.index, name='type-index'),
    path('type/<int:type_id>', views.type.show, name='type-show'),
    path('locality/', views.locality.index, name='locality-index'),
    path('locality/<int:locality_id>', views.locality.show, name='locality-show'),
    path('price/', views.price.index, name='price-index'),
    path('price/<int:price_id>', views.price.show, name='price-show'),
    path('location/', views.location.index, name='location-index'),
    path('location/<int:location_id>', views.location.show, name='location-show'),
    path('show/', views.show_.index, name='show-index'),
    path('show/<int:show_id>', views.show_.show, name='show-show'),
    path('representation/', views.representation.index, name='representation-index'),
    path('representation/<int:representation_id>', views.representation.show, name='representation-show'),
   
    path('rss/shows/', BookableShowFeed(), name='rss_shows'),

    path('api/artists/list', ArtistListCreateView.as_view(), name='artist-list'),
    path('api/artists/<int:pk>/', ArtistRetrieveUpdateDestroyView.as_view(), name='artist-detail'),
    path('api/user-meta/', user_meta_list, name='user_meta_list'),
    path('api/artists/', artist_list, name='artist-list-api'),
    path('api/representations/', representation_list, name='representation-list'),
    
    path('api/cart/add/', add_to_cart, name='add-to-cart'),
    path('api/cart/', get_cart, name='get-cart'),
    path('api/cart/update/', update_cart_item, name='update-cart-item'),
    path('api/cart/remove/', remove_cart_item, name='remove-cart-item'),
     
    path('api/shows/', ShowListAPIView.as_view(), name='show-list-api'),
    path('api/shows/<int:id>/', ShowDetailAPIView.as_view(), name='show-detail-api'),
    path('api/user-meta/<int:user_id>/', UserMetaDetailView.as_view(), name='user-meta-detail'),
    path('api/create-stripe-session/', CreateStripeSessionView.as_view(), name='create-stripe-session'),
    
    
]

admin.site.index_title = "Projet Réservations"
admin.site.index_header = "Projet Réservations HEADER"
admin.site.site_title = "Spectacles"

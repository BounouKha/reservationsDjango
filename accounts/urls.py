from django.urls import path
from .views import ClearCartView, DeleteCartItemView, LoginView, LogoutView, PaymentSuccessView, PriceListAPIView, UpdateCartItemView, UserCartView, UserMetaDetailView, UserReservationsView, UserSignUpView, profile, UserUpdateView, delete
from .views import check_auth
from accounts import views

app_name = 'accounts'

urlpatterns = [
    path('signup/', UserSignUpView.as_view(), name='user-signup'),
    path('profile/', profile, name='user-profile'),
    path('profile/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('profile/delete/<int:pk>/', delete, name='user-delete'),

    path('api/auth/check/', check_auth, name='check_auth'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    
    path('api/user-meta/<int:user_id>/', UserMetaDetailView.as_view(), name='user-meta-detail'),
    path('api/user-cart/<int:user_id>/', UserCartView.as_view(), name='user-cart'),
    path('api/user-cart/update/', UpdateCartItemView.as_view(), name='update-cart-item'),  # Nouvelle route pour PATCH
    path('api/user-cart/delete/<int:user_id>/', DeleteCartItemView.as_view(), name='delete-cart-item'),  # Route pour DELETE
    path('api/clear-cart/', ClearCartView.as_view(), name='clear-cart'),
    path('api/user-reservations/<int:user_id>/', UserReservationsView.as_view(), name='user-reservations'),
    path('api/payment-success/', PaymentSuccessView.as_view(), name='payment-success'),
    path('api/prices/', PriceListAPIView.as_view(), name='price-list'),
]

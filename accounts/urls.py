from django.urls import path
from .views import UserSignUpView, profile, UserUpdateView, delete
from .views import check_auth

app_name = 'accounts'

urlpatterns = [
    path('signup/', UserSignUpView.as_view(), name='user-signup'),
    path('profile/', profile, name='user-profile'),
    path('profile/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('profile/delete/<int:pk>/', delete, name='user-delete'),
    path('api/auth/check/', check_auth, name='check_auth'),
]

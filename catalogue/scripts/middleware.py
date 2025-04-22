##Permet la fusion du panier de la session avec le panier de l'utilisateur connectéfrom django.shortcuts import redirect
from django.shortcuts import redirect
from django.urls import reverse

class MergeCartMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and 'cart' in request.COOKIES:
            # Rediriger vers la vue de fusion du panier
            return redirect(reverse('merge_cart'))
        return self.get_response(request)
    

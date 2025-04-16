from django.contrib.syndication.views import Feed
from catalogue.models import Show
from django.urls import reverse
from django.http import HttpRequest

class BookableShowFeed(Feed):
    title = "Spectacles disponibles"
    link = "/rss/shows/"
    description = "Flux RSS des spectacles réservables."

    def items(self):
        return Show.objects.filter(bookable=True)

    def item_title(self, item):
        return item.title

    def item_link(self, item):
        # Utilisation d'un lien absolu via reverse et build_absolute_uri
        base_url = 'http://localhost:8000'  # 
        return f"{base_url}{reverse('catalogue:show-show', args=[item.id])}"

    def item_description(self, item):
        return item.description

from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from catalogue.models import Show

def show_detail(request, slug, created_in):
    show = get_object_or_404(Show, slug=slug, created_in=created_in)
    return HttpResponse(f"Details of show: {show.title}")
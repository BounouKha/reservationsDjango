from gc import get_objects

from django.shortcuts import render, redirect, get_object_or_404
from django.http import Http404
from pyexpat.errors import messages
from django.contrib import messages
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.decorators import user_passes_test

from catalogue.forms.ArtistForm import ArtistForm
from catalogue.models import Artist


# Create your views here.
def index(request):
    artists = Artist.objects.all()

    return render(request, 'artist/index.html', {
        'artists': artists,
    })


def show(request, artist_id):
    try:
        artist = Artist.objects.get(id=artist_id)
    except Artist.DoesNotExist:
        raise Http404('Artist inexistant')

    return render(request, 'artist/show.html', {
        'artist': artist,
    })


def edit(request, artist_id):
    # fetch the object related to passed id
    artist = Artist.objects.get(id=artist_id)

    # pass the object as instance in form
    form = ArtistForm(request.POST or None, instance=artist)

    if request.method == 'POST':  # TODO http_override doesn't work
        # save the data from the form and
        # redirect to detail_view
        if form.is_valid():
            form.save()
            messages.success(request, "Artiste modifié avec succès.")
            return render(request, "artist/show.html", {
                'artist': artist,
            })
        else:
            messages.error(request, "Artiste modifié avec succès.")
    return render(request, 'artist/edit.html', {
        'form': form,
        'artist': artist,
    })


def create(request):
    form = ArtistForm(request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.add_message(request, messages.SUCCESS, "Nouvel artiste créé avec succès.")
            return redirect('catalogue:artist-index')
        else:
            messages.add_message(request, messages.ERROR, "Echec de l'ajout d'un nouvel artiste!.")
    return render(request, 'artist/create.html', {
        'form': form,
    })


def delete(request, artist_id):
    artist = get_object_or_404(Artist, id=artist_id)
    if request.method == 'POST':
        artist.delete()
        messages.success(request, 'Artiste supprimé avec succès.')
        return redirect('catalogue:artist-index')
    else:
        messages.error(request, "L'artiste n'a pas été supprimé!")
    return render(request, 'artist/show.html', {
        'artist': artist,
    })





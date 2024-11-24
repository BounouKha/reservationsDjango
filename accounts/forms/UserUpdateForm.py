from django import forms
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from accounts.forms.UserSignUpForm import Language
from catalogue.models import UserMeta
from django.db import models




class UserUpdateForm(UserChangeForm):
    username = forms.CharField(max_length=30)
    first_name = forms.CharField(max_length=60)
    last_name = forms.CharField(max_length=60)
    email = forms.EmailField()
    password = None
    langue = forms.ChoiceField(choices=Language)

    # Définition des choix de langue
    class Language(models.TextChoices):
        NONE = "", "Choisissez votre langue"
        FRENCH = "fr", "Français"
        ENGLISH = "en", "English"
        DUTCH = "nl", "Nederlands"

    def __init__(self, *args, **kwargs):
        super(UserUpdateForm, self).__init__(*args, **kwargs)
        self.fields['username'].label = 'Login'
        self.fields['first_name'].label = 'Prénom'
        self.fields['last_name'].label = 'Nom'
        self.fields['username'].help_text = None
        # Récupérer les metadonnées de l'utilisateur
        user = kwargs.get('instance')
        if user and hasattr(user, 'usermeta'):  # Vérifie si l'utilisateur a des métadonnées
            self.initial['langue'] = user.usermeta.langue


    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'langue']


def save(self, commit=True):
        user = super(UserUpdateForm, self).save(commit=False)
        user.save()

        if self.cleaned_data['langue']:
            user_meta = UserMeta.objects.get(user_id=user.id)
            user_meta.langue = self.cleaned_data['langue']
            user_meta.save()
        return user

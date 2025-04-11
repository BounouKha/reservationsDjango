from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from catalogue.models import UserMeta
from django.db import models


class UserSignUpForm(UserCreationForm):
    class Language(models.TextChoices):
        NONE = "", "Choisissez votre langue"
        FRENCH = "fr", "Français"
        ENGLISH = "en", "English"
        DUTCH = "nl", "Nederlands"

    # Définir les types de champs
    username = forms.CharField(max_length=30, label='Login')
    first_name = forms.CharField(max_length=60, label='Prénom')
    last_name = forms.CharField(max_length=60, label='Nom')
    email = forms.EmailField(label='Email')
    langue = forms.ChoiceField(choices=Language.choices, label='Langue')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Personnalisation des labels et des aides
        self.fields['password1'].label = 'Mot de passe'
        self.fields['password2'].label = 'Confirmation du mot de passe'
        self.fields['username'].help_text = None
        self.fields['password1'].help_text = None
        self.fields['password2'].help_text = None

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password1',
            'password2',
            'first_name',
            'last_name',
            'langue',
        ]

    def save(self, commit=True):
        user = super(UserSignUpForm, self).save(commit=False)

        # Sauvegarde de l'utilisateur
        if commit:
            user.save()

            # Ajout de l'utilisateur au groupe MEMBER
            memberGroup, created = Group.objects.get_or_create(name='MEMBER')
            memberGroup.user_set.add(user)

            # Ajout des métadonnées utilisateur (langue)
            if self.cleaned_data['langue']:
                user_meta = UserMeta(
                    user=user, langue=self.cleaned_data['langue'])
                user_meta.save()

        return user

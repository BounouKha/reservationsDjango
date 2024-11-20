from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User, Group
from catalogue.models import UserMeta
from django.db import models


# Définition des choix de langue
class Language(models.TextChoices):
    NONE = "", "Choisissez votre langue"
    FRENCH = "fr", "Français"
    ENGLISH = "en", "English"
    DUTCH = "nl", "Nederlands"


class UserSignUpForm(UserCreationForm):
    username = forms.CharField(max_length=30, label="Login")
    first_name = forms.CharField(max_length=60, label="Prénom")
    last_name = forms.CharField(max_length=60, label="Nom")
    email = forms.EmailField(label="Adresse e-mail")
    langue = forms.ChoiceField(choices=Language.choices, label="Langue préférée")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].label = 'Mot de passe'
        self.fields['password2'].label = 'Confirmation du mot de passe'

        # Suppression des aides contextuelles par défaut
        for field_name in ['username', 'password1', 'password2']:
            self.fields[field_name].help_text = None

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
        # Créer l'utilisateur sans le sauvegarder immédiatement
        user = super().save(commit=False)
        if commit:
            user.save()

        # Ajouter l'utilisateur au groupe MEMBER
        member_group, created = Group.objects.get_or_create(name='MEMBER')
        member_group.user_set.add(user)

        # Créer les métadonnées utilisateur
        if self.cleaned_data['langue']:
            user_meta = UserMeta(
                user=user,
                langue=self.cleaned_data['langue'],
            )
            user_meta.save()

        return user

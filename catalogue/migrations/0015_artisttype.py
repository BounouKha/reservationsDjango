# Generated by Django 5.2 on 2025-04-09 14:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0014_alter_artist_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='ArtistType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('artist', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='a_artistTypes', to='catalogue.artist')),
                ('type', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='t_artistTypes', to='catalogue.type')),
            ],
            options={
                'db_table': 'artist_type',
            },
        ),
    ]

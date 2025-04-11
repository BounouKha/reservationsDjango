# Generated by Django 5.2 on 2025-04-09 13:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0011_review'),
    ]

    operations = [
        migrations.AddField(
            model_name='artist',
            name='types',
            field=models.ManyToManyField(db_table='artist_type', related_name='artists', to='catalogue.type'),
        ),
        migrations.AlterModelTable(
            name='artist',
            table='artists',
        ),
    ]

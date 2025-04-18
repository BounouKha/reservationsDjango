# Generated by Django 5.1.4 on 2025-01-10 03:40

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0005_location'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('booking_date', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(max_length=60)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='reservations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reservations',
            },
        ),
    ]

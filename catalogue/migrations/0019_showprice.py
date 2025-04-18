# Generated by Django 5.2 on 2025-04-11 10:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0018_alter_usermeta_langue_alter_usermeta_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShowPrice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='catalogue.price')),
                ('show', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='catalogue.show')),
            ],
            options={
                'db_table': 'show_prices',
                'unique_together': {('show', 'price')},
            },
        ),
    ]

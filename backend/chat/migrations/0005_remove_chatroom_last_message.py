# Generated by Django 5.1.3 on 2025-03-19 19:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_chatroom_last_message'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chatroom',
            name='last_message',
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-09 00:24
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0003_auto_20170309_0006'),
    ]

    operations = [
        migrations.RenameField(
            model_name='rolepermission',
            old_name='permission_id',
            new_name='permission',
        ),
        migrations.RenameField(
            model_name='rolepermission',
            old_name='role_id',
            new_name='role',
        ),
    ]
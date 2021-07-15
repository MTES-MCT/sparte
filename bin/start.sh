#!/bin/bash

python manage.py migrate
gunicorn config.wsgi --log-file -

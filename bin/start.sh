#!/bin/bash

# Execute migrations
python manage.py migrate users
python manage.py migrate

# launch webserver
gunicorn config.wsgi --log-file -

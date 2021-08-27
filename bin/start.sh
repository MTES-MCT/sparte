#!/bin/bash

# Execute migrations
python manage.py migrate users
python manage.py migrate

# launch webserver
gunicorn config.wsgi \
--workers 9 \
--timeout 180 \
--log-file -

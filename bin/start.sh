#!/bin/bash

# Execute migrations
python manage.py migrate users
python manage.py migrate

# load new parameters if any
python manage.py load_param --no-update --file required_parameters.json

# launch webserver
gunicorn config.wsgi \
--workers 9 \
--timeout 180 \
--log-file -

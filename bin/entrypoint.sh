#!/bin/bash
set -e

# python manage.py collectstatic --noinput    # Fait dans le dockerfile
python manage.py migrate

exec "$@"

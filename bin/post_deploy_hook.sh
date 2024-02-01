#!/bin/sh

echo "python=$(python --version)"
echo "django=$(python -m django --version)"

# export PYTHONPATH=/build/${REQUEST_ID}/.apt/usr/lib/python3/dist-packages/:${PYTHONPATH}
export LD_LIBRARY_PATH=/build/${REQUEST_ID}/.apt/usr/lib/x86_64-linux-gnu/blas/:/build/${REQUEST_ID}/.apt/usr/lib/x86_64-linux-gnu/lapack/:${LD_LIBRARY_PATH}
export PROJ_LIB=/build/${REQUEST_ID}/.apt/usr/share/proj

# Activate maintenance mode to avoid creating bugs during migrations
python manage.py maintenance --on

# Execute structure migrations
python manage.py migrate users
python manage.py migrate

# load new parameters if any
python manage.py load_param --no-update --file required_parameters.json

# Execute data migrations if under 30 minutes
# eg. python manage.py migrate_trajectory

# collect static
python manage.py collectstatic --noinput

# clear cache
python manage.py clear_cache

# Deactivating maintenance mode
python manage.py maintenance --off

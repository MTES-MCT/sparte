#!/bin/sh

echo "python=$(python --version)"
echo "django=$(python -m django --version)"

# export PYTHONPATH=/build/${REQUEST_ID}/.apt/usr/lib/python3/dist-packages/:${PYTHONPATH}
export LD_LIBRARY_PATH=/build/${REQUEST_ID}/.apt/usr/lib/x86_64-linux-gnu/blas/:/build/${REQUEST_ID}/.apt/usr/lib/x86_64-linux-gnu/lapack/:${LD_LIBRARY_PATH}
export PROJ_LIB=/build/${REQUEST_ID}/.apt/usr/share/proj

# Execute structure migrations
python manage.py migrate users
python manage.py migrate

# load new parameters if any
python manage.py load_param --no-update --file required_parameters.json

# clear cache
python manage.py clear_cache

# Deactivating maintenance mode
python manage.py maintenance --off

python manage.py mattermost --msg "${APP} déploiement quasiment terminé, ${DOMAIN_URL}" --channel "${MATTER_DEV_CHANNEL}"

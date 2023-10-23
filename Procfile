web: bash bin/start.sh
celerydefaultworker: celery --app=config.celery.app worker --loglevel=INFO --concurrency=4 --max-tasks-per-child=1
celerylongworker: celery --app=config.celery.app worker --loglevel=INFO --concurrency=4 --max-tasks-per-child=1 -Q long
celerybeat: celery --app=config.celery.app beat --loglevel=debug

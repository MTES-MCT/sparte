web: bash bin/start.sh
celeryquickworker: celery --app=config.celery.app worker --loglevel=INFO --concurrency=4 --max-tasks-per-child=1 -Q quick
celerylongworker: celery --app=config.celery.app worker --loglevel=INFO --concurrency=4 --max-tasks-per-child=1 -Q long
celerybeat: celery --app=config.celery.app beat --loglevel=debug

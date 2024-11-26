#!/bin/bash

gunicorn config.wsgi \
--workers 9 \
--timeout 180 \
--log-file -

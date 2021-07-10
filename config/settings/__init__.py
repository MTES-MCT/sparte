# ignore completly the file for flake8:
# flake8: noqa
from .base import *

# ignore particular errors:
from .crispy import *  # noqa: F401,F403
from .customUser import *

# ignore completly the file for flake8:
# flake8: noqa
from .base import *

# ignore particular errors:
from .third_party import *  # noqa: F401,F403
from .project import *

"""
Common logic shared by all games.
"""

import sys

def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

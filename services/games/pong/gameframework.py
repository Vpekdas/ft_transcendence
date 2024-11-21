"""
Common logic shared by both games.
"""

import sys

def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

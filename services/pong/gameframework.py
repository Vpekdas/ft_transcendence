"""
Common logic shared by all games.
"""

import sys
import websockets

def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

class Game:
    def __init__(self):
        pass

    async def message_handler(websocket):
        async for message in websocket:
            log(message)

    async def run(self):
        async with websockets.serve(self.message_handler, "0.0.0.0", 1972) as server:
            await server.serve_forever()

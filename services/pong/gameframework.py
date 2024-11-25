"""
Common logic shared by all games.
"""

import sys
import websockets
import json

def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

class Game:
    def __init__(self):
        pass

    async def on_message(self, ws, message):
        pass

    async def message_handler(self, ws):
        async for message in ws:
            data = json.loads(message)
            await self.on_message(ws, data)

    async def run(self):
        async with websockets.serve(self.message_handler, "0.0.0.0", 1972) as server:
            await server.serve_forever()

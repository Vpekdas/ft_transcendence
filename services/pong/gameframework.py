"""
Common logic shared by all games.
"""

import asyncio
import sys
import websockets
import json
import random
import string
import threading

from websockets import WebSocketServer
from http.server import HTTPServer, BaseHTTPRequestHandler

def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

class Game:
    def __init__(self):
        pass

    async def on_message(self, ws: WebSocketServer, message):
        pass

"""
createGame(config) => Create a new game and return an handle to it.
"""
class GameServer(HTTPServer):
    class WebSocket:
        def __init__(self, server):
            self.server = server

        async def message_handler(self, ws: WebSocketServer):
            async for message in ws:
                data = json.loads(message)
                
                if "game" in data and data["game"] in self.server.games:
                    game = self.server.games[data["game"]]

                    await game.on_message(ws, data)

        async def run():
            async with websockets.serve(self.message_handler, "0.0.0.0", 1972) as server:
                await server.serve_forever()

    class HTTPHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            data = self.rfile.read(int(self.headers.get('Content-Length')))

            if self.path == "/createGame":
                data = json.loads(data)
                result = self.server.on_create_game(data)

                if result is None:
                    self.send_error(500, json.dumps({ "error": "No game was created" }))
                else:
                    self.send_response(200, json.dumps({ "id": result }))

    games = {}
    ws = None
    loop = None

    def __init__(self, server_address, RequestHandlerClass=HTTPHandler):
        HTTPServer.__init__(self, server_address, RequestHandlerClass)

        self.loop = asyncio.get_event_loop()
        self.loop.create_task(self.WebSocket.run())

    def make_id(self) -> str:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

    def is_gid_unique(self, id) -> str:
        return id in games

    def run_game(self, id, game):
        self.games[id] = game

    def on_create_game(self, data):
        return False

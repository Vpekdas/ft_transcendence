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

        async def run(self):
            async with websockets.serve(self.message_handler, "0.0.0.0", 1972) as server:
                log("Websocket listening on 0.0.0.0:1972")
                await server.serve_forever()

    class HTTPHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            data = self.rfile.read(int(self.headers.get('Content-Length')))

            if self.path == "/createGame":
                data = json.loads(data)
                result = self.server.on_create_game(data)

                if result is None:
                    self.send_response_ex(json.dumps({ "error": "No game was created" }))
                else:
                    self.send_response_ex(json.dumps({ "id": result }))
            else:
                self.send_response_ex(json.dumps({ "error": "Invalid route" }), 404)
        
        def send_response_ex(self, content: str, code=200, content_type="application/json"):
            self.send_response(code)
            self.send_header("Content-Type", content_type)
            self.end_headers()
            self.wfile.write(content.encode())

    games = {}
    ws = None

    def ws_thread(self):
        loop = asyncio.new_event_loop()
        tasks = set()

        task = loop.create_task(self.WebSocket(self).run(), name="Websocket")
        task.add_done_callback(tasks.discard)
        tasks.add(task)

        loop.run_until_complete(asyncio.wait(tasks))
        loop.close()

    def __init__(self, server_address, RequestHandlerClass=HTTPHandler):
        HTTPServer.__init__(self, server_address, RequestHandlerClass)

        t = threading.Thread(target=self.ws_thread)
        t.start()

    def make_id(self) -> str:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

    def is_gid_unique(self, id) -> str:
        return id in self.games

    def run_game(self, id, game):
        self.games[id] = game

    def on_create_game(self, data):
        return False

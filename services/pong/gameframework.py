"""
Common logic shared by all games.
"""

import asyncio
import sys
import websockets
import json
import random
import string

from websockets import WebSocketServer
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread

def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

class Vec3:
    x: float
    y: float
    z: float

    def __init__(self, x=0, y=0, z=0):
        self.x = x
        self.y = y
        self.z = z

    def __str__(self):
        return f"[{self.x}, {self.y}, {self.z}]"

    def to_dict(self):
        return { "x": self.x, "y": self.y, "z": self.z }

class Box:
    min: Vec3
    max: Vec3

    def is_colliding(other) -> bool:
        return a.min.x <= b.max.x and a.max.x >= b.min.x and a.min.y <= b.max.y and a.max.y >= b.min.y and a.min.z <= b.max.z and a.max.z >= b.min.z

class Game:
    class Runner:
        def __init__(self, game):
            self.game = game

        def run():
            asyncio.run(self.game.run())

    connections = list()
    thread: Thread = None

    def __init__(self):
        pass

    def start():
        thread = Thread(target=self.Runner(self))
        thread.start()

    async def on_update(self, ws):
        pass

    async def on_message(self, ws: WebSocketServer, message):
        pass

    async def run_forever(self, ws):
        while True:
            await self.on_update(ws.ws)

class Connection:
    server = None
    thread: Thread

    address: str
    listening_port: int

    class Runner:
        def __init__(self, conn):
            self.conn = conn

        def run(self):
            asyncio.run(self.conn.run())

    def __init__(self, server, address, listening_port):
        self.server = server
        self.address = address
        self.listening_port = listening_port

        log(f"New connection listening on 0.0.0.0:{listening_port}")
        thread = Thread(target=self.Runner(self).run)
        thread.start()

    async def message_handler(self, ws):
        async for message in ws:
            try:
                data = json.loads(message)

                if "type" not in data:
                    continue

                if data["type"] == "matchmaking" and "mode" in data:
                    id = self.server.do_matchmaking(self, ws, data["mode"])

                    if id is not None:
                        await ws.send({ "type": "matchFound", "id": id })
                    else:
                        pass
            except json.JSONDecodeError:
                pass

    async def run(self):
        async with websockets.serve(self.message_handler, "0.0.0.0", self.listening_port) as server:
            await server.serve_forever()

class GameServer(HTTPServer):
    class HTTPHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            data = self.rfile.read(int(self.headers.get('Content-Length')))

            if self.path == "/connect":
                ws_port = self.server.find_valid_port()
                conn = Connection(self.server, self.address_string(), ws_port)
                self.server.connections.append(conn)

                self.send_response_ex(json.dumps({ "port": ws_port }))
            else:
                self.send_response_ex("", code=404)

        def send_response_ex(self, content: str, code=200, content_type="application/json"):
            self.send_response(code)
            self.send_header("Content-Type", content_type)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(content.encode())

    games: dict[str, Game] = dict()
    connections: list[Connection] = list()

    def __init__(self, server_address, RequestHandlerClass=HTTPHandler):
        HTTPServer.__init__(self, server_address, RequestHandlerClass)

        log(f"Listening for new connections on {server_address[0]}:{server_address[1]}")

    def make_id(self, k=8) -> str:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

    """
    Find a port in the range `2000-3000` which is not already in used.
    """
    def find_valid_port(self):
        for port in range(2000, 3000):
            lst = filter(lambda conn: conn.listening_port == port, self.connections)

            try:
                next(lst)
            except:
                return port
        return None

    def start_game(self, game: Game) -> str:
        id = self.make_id()
        self.games[id] = game

        log("Creating new game with id", id)
        game.start()

    ##
    ## Handlers
    ##

    def do_matchmaking(self, conn: Connection, mode: str):
        pass

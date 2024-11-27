"""
Common logic shared by all games.
"""

import asyncio
import sys
import websockets
import json
import random
import string

from websockets.asyncio.server import serve, broadcast, Server, ServerConnection
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread

# https://stackoverflow.com/questions/71384132/best-approach-to-multiple-websocket-client-connections-in-python
# https://discuss.python.org/t/websocket-messages-sent-to-multiple-clients-are-not-being-received/62781

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
    id: str
    port: int = 2000
    ws: Server

    async def start(self):
        # await asyncio.create_task(self.run())
        thread = Thread(target=lambda: asyncio.run(self.run()))
        thread.start()

    async def run(self):
        while True:
            await self.on_update()
            await asyncio.sleep(0.010)

    async def broadcast(self, data):
        try:
            for conn in self.ws.connections:
                await conn.send(data)
        except:
            pass

    #
    # Callbacks
    #

    async def on_message(self, msg):
        pass

    async def on_update(self):
        pass

class GameServer:
    games: dict[str, Game] = {}
    ws: Server
    loop = None

    def serve_forever(self):
        asyncio.run(self.run())

    async def message_handler(self, ws: ServerConnection):
        async for message in ws:
            try:
                data = json.loads(message)

                if "type" not in data:
                    continue

                if data["type"] == "matchmake" and "gamemode" in data:
                    game = await self.do_matchmaking(data["gamemode"])

                    if game is not None:
                        await ws.send(json.dumps({ "type": "matchFound", "id": game.id }))
                    else:
                        log("Something went wrong...")
                elif "id" in data and data["id"] in self.games:
                    game = self.games[data["id"]]
                    await game.on_message(data)
            except json.JSONDecodeError:
                pass

    async def run(self):
        self.ws = await serve(self.message_handler, "0.0.0.0", 1972)
        log(f"Listening on 0.0.0.0:{1972}")
        await self.ws.serve_forever()

    def make_id(self, k=8) -> str:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

    async def start_game(self, game: Game) -> str:
        id = self.make_id()
        self.games[id] = game

        game.id = id
        game.ws = self.ws

        log(f"Game started with id", game.id)
        await game.start()

    #
    # Callbacks
    #

    async def do_matchmaking(self) -> Game:
        return None

"""
Common logic shared by all games.
"""

import asyncio
import sys
import websockets
import json
import random
import string

from math import sqrt

from websockets.asyncio.server import serve, broadcast, Server, ServerConnection
from websockets.protocol import State
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

    def __add__(self, other):
        if isinstance(other, Vec3):
            return Vec3(self.x + other.x, self.y + other.y, self.z + other.z)

    def to_dict(self):
        return { "x": self.x, "y": self.y, "z": self.z }

class CollisionResult:
    normal: Vec3
    collider = None

    def __init__(self, normal=Vec3(), collider=None):
        self.normal = normal
        self.collider = collider

class Boundary:
    min = Vec3()
    max = Vec3()

    def __init__(self, min, max):
        self.min = min
        self.max = max

class Sphere:
    center = Vec3()
    radius: float = 1.0

    def __init__(self, radius, center=Vec3()):
        self.radius = radius
        self.center = center

    def translate(self, pos: Vec3):
        return Sphere(self.radius, pos)

    def test_collision(self, other) -> CollisionResult:
        if isinstance(other, Box):
            return other.test_collision(self)
        return None

class Box:
    min: Vec3
    max: Vec3

    def __init__(self, min, max):
        self.min = min
        self.max = max

    def translate(self, pos: Vec3):
        return Box(self.min + pos, self.max + pos)

    def test_collision(self, other) -> CollisionResult:
        if isinstance(other, Box):
            if self.min.x <= other.max.x and self.max.x >= other.min.x and self.min.y <= other.max.y and self.max.y >= other.min.y and self.min.z <= other.max.z and self.max.z >= other.min.z:
                return CollisionResult(collider=other)
        elif isinstance(other, Sphere):
            test_x = other.center.x
            test_y = other.center.y
            test_z = other.center.z

            if other.center.x < self.min.x: test_x = self.min.x
            elif other.center.x > self.max.x: test_x = self.max.x

            if other.center.y < self.min.y: test_y = self.min.y
            elif other.center.y > self.max.y: test_y = self.max.y

            if other.center.z < self.min.z: test_z = self.min.z
            elif other.center.z > self.max.z: test_z = self.max.z

            dist_x = other.center.x - test_x
            dist_y = other.center.y - test_y
            dist_z = other.center.z - test_z

            dist = sqrt((dist_x * dist_x) + (dist_y * dist_y) + (dist_z * dist_z))

            if dist <= other.radius:
                return CollisionResult(collider=other)
        return None

class Scene:
    bodies: list = []

    def add_body(self, body):
        body.scene = self
        self.bodies.append(body)

    def update(self):
        for body in self.bodies:
            body.process()

    def test_collision(self, ibody) -> CollisionResult:
        for body in self.bodies:
            if body is ibody:
                continue
            r = body.test_collision(ibody)
            if r is not None:
                #if isinstance(r.collider, Box): print(r.collider, r.collider.min, r.collider.max)
                return r
        return None

"""
Represent a remote client in a game.
"""
class Client:
    id: str
    inputs: dict[str, bool] = dict()

    def __init__(self, id: str):
        self.id = id
        self.inputs = dict()

    def is_pressed(self, name):
        return name in self.inputs and self.inputs[name]

    def on_input(self, data):
        action_name = data["action_name"]
        action_type = data["action"]

        if action_type == "press":
            self.inputs[action_name] = True
        elif action_type == "release":
            self.inputs[action_name] = False

class Body:
    scene: Scene
    pos: Vec3 = Vec3()
    velocity: Vec3 = Vec3()
    shape = None

    client: Client = None

    def __init__(self):
        pass

    def try_move(self):
        if self.scene.test_collision(self) is None:
            self.pos += self.velocity

    def test_collision(self, rb) -> CollisionResult:
        if rb.shape is None or self.shape is None: return None
        return self.shape.translate(self.pos).test_collision(rb.shape.translate(rb.pos))

    def process(self):
        pass

class Game:
    id: str
    port: int = 2000
    ws: Server
    conns: list[ServerConnection] = []
    clients: dict[str, Client] = {}

    async def start(self):
        thread = Thread(target=lambda: asyncio.run(self.run()))
        thread.start()

    async def run(self):
        while len(self.active_connections()) > 0:
            await self.on_update()
            await asyncio.sleep(0.010)

        log(f"Game with id {self.id} exited")

    async def broadcast(self, data):
        try:
            broadcast(self.conns, data, raise_exceptions=True)
        except:
            pass

    def active_connections(self) -> list[ServerConnection]:
        return list(filter(lambda conn: conn.state == State.OPEN, self.conns))

    def get_client(self, id) -> Client:
        return self.clients[id] if id in self.clients else None

    #
    # Callbacks
    #

    async def on_unhandled_message(self, msg):
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
        try:
            async for message in ws:
                try:
                    data = json.loads(message)

                    if "type" not in data:
                        continue

                    if data["type"] == "matchmake" and "gamemode" in data:
                        game = await self.do_matchmaking(ws, data["gamemode"])

                        if game is not None:
                            await ws.send(json.dumps({ "type": "matchFound", "id": game.id }))
                        else:
                            log("Something went wrong...")
                    elif "id" in data and data["id"] in self.games:
                        game = self.games[data["id"]]

                        if data["type"] == "input":
                            client = game.get_client(data["player"])
                            if client is not None: client.on_input(data)
                        else:
                            await game.on_unhandled_message(data)
                except json.JSONDecodeError:
                    pass
        except:
            pass

    async def run(self):
        self.ws = await serve(self.message_handler, "0.0.0.0", 1972)
        log(f"Listening on 0.0.0.0:{1972}")
        await self.ws.serve_forever()

    def make_id(self, k=8) -> str:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

    async def start_game(self, conn: ServerConnection, game: Game) -> str:
        id = self.make_id()
        self.games[id] = game

        game.id = id
        game.ws = self.ws
        game.conns.append(conn)

        log(f"Game started with id", game.id)
        await game.start()

    #
    # Callbacks
    #

    async def do_matchmaking(self) -> Game:
        return None

"""
Common logic shared by all games.
"""

import asyncio
import sys
import websockets
import json
import random
import string
import enum

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
    def __init__(self, x=0, y=0, z=0):
        self.x = x
        self.y = y
        self.z = z

    def __str__(self):
        return f"[{self.x}, {self.y}, {self.z}]"

    def __add__(self, other):
        if isinstance(other, Vec3):
            return Vec3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other):
        if isinstance(other, Vec3):
            return Vec3(self.x - other.x, self.y - other.y, self.z - other.z)

    def __mul__(self, other):
        if isinstance(other, float) or isinstance(other, int):
            return Vec3(self.x * other, self.y * other, self.z * other)

    def __neg__(self):
        return Vec3(-self.x, -self.y, -self.z)

    def is_zero_approx(self):
        e = 10e-5;
        return abs(self.x) <= e and abs(self.y) <= e and abs(self.z) <= e

    def length(self) -> float:
        return sqrt(self.x * self.x + self.y * self.y + self.z * self.z)

    def normalized(self):
        l = self.length()
        return Vec3(self.x / l, self.y / l, self.z / l)

    def to_dict(self):
        return { "x": self.x, "y": self.y, "z": self.z }

class CollisionResult:
    def __init__(self, normal=Vec3(), collider=None):
        self.normal = normal
        self.collider = collider

class Boundary:
    def __init__(self, min, max):
        self.min = min
        self.max = max

class Sphere:
    def __init__(self, radius=1.0, center=Vec3()):
        self.radius = radius
        self.center = center

    def translate(self, pos: Vec3):
        return Sphere(self.radius, pos)

class Box:
    def __init__(self, min, max):
        self.min = min
        self.max = max

    def translate(self, pos: Vec3):
        return Box(self.min + pos, self.max + pos)

def check_collision(a, b) -> bool:
    if isinstance(a, Box) and isinstance(b, Box):
        if a.min.x <= b.max.x and a.max.x >= b.min.x and a.min.y <= b.max.y and a.max.y >= b.min.y and a.min.z <= b.max.z and a.max.z >= b.min.z:
            return CollisionResult(collider=other)
    elif isinstance(a, Sphere) and isinstance(b, Box):
        test_x = a.center.x
        test_y = a.center.y
        test_z = a.center.z

        if a.center.x < b.min.x: test_x = b.min.x
        elif a.center.x > b.max.x: test_x = b.max.x

        if a.center.y < b.min.y: test_y = b.min.y
        elif a.center.y > b.max.y: test_y = b.max.y

        if a.center.z < b.min.z: test_z = b.min.z
        elif a.center.z > b.max.z: test_z = b.max.z

        dist_x = a.center.x - test_x
        dist_y = a.center.y - test_y
        dist_z = a.center.z - test_z

        dist = sqrt((dist_x * dist_x) + (dist_y * dist_y) + (dist_z * dist_z))

        return dist <= a.radius

class Scene:
    def __init__(self):
        self.bodies = []

    def add_body(self, body):
        body.scene = self
        self.bodies.append(body)

    def update(self):
        for body in self.bodies:
            body.process()

    def test_collision(self, ibody) -> CollisionResult:
        for body in self.bodies:
            if body == ibody:
                continue
            r = body.test_collision(ibody)
            if r is not None:
                return r
        return None

"""
Represent a remote client in a game.
"""
class Client:
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

class BodyType(enum.Enum):
    STATIC = 0
    DYNAMIC = 1

class Body:
    def __init__(self, *, scene: Scene=None, shape=None, type=BodyType.STATIC, client=None):
        self.scene = scene
        self.pos = Vec3()
        self.velocity = Vec3()
        self.shape = shape
        self.type = type
        self.client = client

        # Physics properties

        # The "bounce" property of the body. 0 means nothing will bounce, 1.0 means total conservation of energy
        self.bounce = 0.0

    def try_move(self):
        res = None

        current_speed = self.velocity.length()

        while True:
            res = self.scene.test_collision(self)

            if res is None:
                self.pos += self.velocity
                break
            else:
                self.velocity.x *= 1.0 - 0.1
                self.velocity.y *= 1.0 - 0.1
                self.velocity.z *= 1.0 - 0.1
                if self.velocity.is_zero_approx():
                    if self.type == BodyType.DYNAMIC:
                        self.velocity = res.normal * current_speed
                    else:
                        break
        return res

    def test_collision(self, rb) -> CollisionResult:
        if rb.shape is None or self.shape is None: return None

        shape_a = self.shape.translate(self.pos)
        shape_b = rb.shape.translate(rb.pos)

        direction = (rb.pos - self.pos).normalized()

        if isinstance(shape_b, Sphere):
            if check_collision(shape_b, shape_a):
                return CollisionResult(collider=rb, normal=direction)
        else:
            if check_collision(shape_a, shape_b):
                return CollisionResult(collider=rb)

    def process(self):
        pass

class Game:
    def __init__(self):
        self.id = ""
        self.ws = None
        self.conns = []
        self.clients = {}
        self.scene = Scene()

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
    def __init__(self):
        self.games = {}
        self.ws = None
        self.loop = None

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

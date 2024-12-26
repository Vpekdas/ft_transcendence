"""
Common logic shared by all games.
"""

import asyncio
import sys
import json
import random
import string
import enum
import time
import threading
import datetime

from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread
from datetime import datetime
from math import sqrt
from multiprocessing.pool import ThreadPool
from .errors import *
from .models import Tournament, Player
from .utils import hash_weak_password

# https://stackoverflow.com/questions/71384132/best-approach-to-multiple-websocket-client-connections-in-python
# https://discuss.python.org/t/websocket-messages-sent-to-multiple-clients-are-not-being-received/62781

def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def time_secs():
    return (datetime.now() - datetime(1970, 1, 1)).total_seconds()

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
        if isinstance(other, (int, float)):
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

    def dot(self, other):
        return self.x * other.x + self.y * other.y

    def to_dict(self):
        return { "x": self.x, "y": self.y, "z": self.z }

class CollisionResult:
    def __init__(self, normal=Vec3(), collider=None):
        self.normal = normal
        self.collider = collider

class Sphere:
    def __init__(self, radius=1.0, center=Vec3()):
        self.radius = radius
        self.center = center

    def translate(self, pos: Vec3):
        return Sphere(self.radius, pos)

    def to_dict(self):
        return { "type": "Sphere", "radius": self.radius }

class Box:
    def __init__(self, min, max):
        self.min = min
        self.max = max

    def translate(self, pos: Vec3):
        return Box(self.min + pos, self.max + pos)

    def to_dict(self):
        return { "type": "Box", "min": self.min.to_dict(), "max": self.max.to_dict() }

def check_collision(a, b) -> bool:
    if isinstance(a, Box) and isinstance(b, Box):
        return a.min.x <= b.max.x and a.max.x >= b.min.x and a.min.y <= b.max.y and a.max.y >= b.min.y and a.min.z <= b.max.z and a.max.z >= b.min.z
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
    elif isinstance(a, Box) and isinstance(b, Sphere):
        test_x = b.center.x
        test_y = b.center.y
        test_z = b.center.z

        if b.center.x < a.min.x: test_x = a.min.x
        elif b.center.x > a.max.x: test_x = a.max.x

        if b.center.y < a.min.y: test_y = a.min.y
        elif b.center.y > a.max.y: test_y = a.max.y

        if b.center.z < a.min.z: test_z = a.min.z
        elif b.center.z > a.max.z: test_z = a.max.z

        dist_x = b.center.x - test_x
        dist_y = b.center.y - test_y
        dist_z = b.center.z - test_z

        dist = sqrt((dist_x * dist_x) + (dist_y * dist_y) + (dist_z * dist_z))

        return dist <= b.radius
    elif isinstance(a, Sphere) and isinstance(b, Sphere):
        return (b.center - a.center).length() <= a.radius + b.radius

class Scene:
    def __init__(self):
        self.bodies = []

    def add_body(self, body):
        body.scene = self
        self.bodies.append(body)

    def get_bodies(self, ty: str):
        return filter(lambda b: b.type == ty, self.bodies)

    def update(self):
        for body in self.bodies:
            body.process()

    def test_collision(self, ibody) -> CollisionResult:
        for body in self.bodies:
            if body == ibody or isinstance(body, Area):
                continue
            r = body.test_collision(ibody)
            if r is not None:
                return r
        return None

    def to_dict(self):
        array = []

        for body in self.bodies:
            array.append(body.to_dict())

        return array

"""
Represent a remote client in a game.
"""
class Client:
    def __init__(self, id: int, subid: str=None):
        self.id = id
        self.subid = subid
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

class ClientAI(Client):
    def __init__(self):
        super().__init__(id=-1,subid="ai")

        self.last_update = 0
        self.target_y = None

    def process(self, scene: Scene):
        if time_secs() - self.last_update >= 1:
            self.last_update = time_secs()
            self.scene = scene

            ball: Body = next(scene.get_bodies("Ball"))
            ball.velocity.normalized()

        if self.target_y is not None:
            pass

class BodyType(enum.Enum):
    STATIC = 0
    DYNAMIC = 1
    AREA = 2

def make_id(k=8) -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

class Body:
    def __init__(self, *, type="Body", scene: Scene=None, shape=None, body_type=BodyType.STATIC, client=None, pos=Vec3()):
        self.type = type
        self.scene = scene
        self.pos = pos
        self.velocity = Vec3()
        self.shape = shape
        self.body_type = body_type
        self.client = client
        self.id = make_id()

        # Physics properties

        # The "bounce" property of the body. 0 means nothing will bounce, 1.0 means total conservation of energy
        self.bounce = 0.0

    def _bounce_vec(self, n, v, bounce) -> Vec3:
        u = n * (v.dot(n) / (n.dot(n)))
        w = v - u
        v2 = w - u

        return v2 * bounce

    def try_move(self):
        res = None

        current_speed = self.velocity.length()
        current_dir = Vec3() if self.velocity.is_zero_approx() else self.velocity.normalized()

        while True:
            res = self.scene.test_collision(self)

            if res is None:
                self.pos += self.velocity
                break
            else:
                self.velocity *= 1.0 - 0.1
                if self.velocity.is_zero_approx():
                    self.on_collision(current_dir, res)
                    break
        return res

    def test_collision(self, rb) -> CollisionResult:
        if rb.shape is None or self.shape is None: return None

        body_a = self
        body_b = rb
        shape_a = body_a.shape.translate(self.pos + self.velocity)
        shape_b = body_b.shape.translate(rb.pos + rb.velocity)

        direction = Vec3()

        if isinstance(shape_a, Sphere) and isinstance(shape_b, Box):
            if body_a.pos.x < body_b.pos.x and body_a.pos.y >= shape_b.min.y and body_a.pos.y <= shape_b.max.y:
                direction = Vec3(-1, 0, 0)
            elif body_a.pos.x > body_b.pos.x and body_a.pos.y >= shape_b.min.y and body_a.pos.y <= shape_b.max.y:
                direction = Vec3(1, 0, 0)
            elif body_a.pos.y < body_b.pos.y and body_a.pos.x >= shape_b.min.x and body_a.pos.x <= shape_b.max.x:
                direction = Vec3(0, -1, 0)
            elif body_a.pos.y > body_b.pos.y and body_a.pos.x >= shape_b.min.x and body_a.pos.x <= shape_b.max.x:
                direction = Vec3(0, 1, 0)
            elif body_a.pos.x <= body_b.pos.x and body_a.pos.y >= body_b.pos.y: # Top left corner
                direction = Vec3(-1, 1, 0).normalized()
            elif body_a.pos.x > body_b.pos.x and body_a.pos.y >= body_b.pos.y: # Top right corner
                direction = Vec3(1, 1, 0).normalized()
            elif body_a.pos.x <= body_b.pos.x and body_a.pos.y < body_b.pos.y: # Bottom left corner
                direction = Vec3(-1, -1, 0).normalized()
            elif body_a.pos.x > body_b.pos.x and body_a.pos.y < body_b.pos.y: # Bottom right corner
                direction = Vec3(1, -1, 0).normalized()
        if isinstance(shape_a, Box) and isinstance(shape_b, Sphere):
            if body_b.pos.x < body_a.pos.x and body_b.pos.y >= shape_a.min.y and body_b.pos.y <= shape_a.max.y:
                direction = Vec3(-1, 0, 0)
            elif body_b.pos.x > body_a.pos.x and body_b.pos.y >= shape_a.min.y and body_b.pos.y <= shape_a.max.y:
                direction = Vec3(1, 0, 0)
            elif body_b.pos.y < body_a.pos.y and body_b.pos.x >= shape_a.min.x and body_b.pos.x <= shape_a.max.x:
                direction = Vec3(0, -1, 0)
            elif body_b.pos.y > body_a.pos.y and body_b.pos.x >= shape_a.min.x and body_b.pos.x <= shape_a.max.x:
                direction = Vec3(0, 1, 0)
            elif body_b.pos.x <= body_a.pos.x and body_b.pos.y >= body_a.pos.y: # Top left corner
                direction = Vec3(-1, 1, 0).normalized()
            elif body_b.pos.x > body_a.pos.x and body_b.pos.y >= body_a.pos.y: # Top right corner
                direction = Vec3(1, 1, 0).normalized()
            elif body_b.pos.x <= body_a.pos.x and body_b.pos.y < body_a.pos.y: # Bottom left corner
                direction = Vec3(-1, -1, 0).normalized()
            elif body_b.pos.x > body_a.pos.x and body_b.pos.y < body_a.pos.y: # Bottom right corner
                direction = Vec3(1, -1, 0).normalized()
        else:
            # This should work for sphere vs sphere
            direction = (rb.pos - self.pos).normalized()

        if check_collision(shape_a, shape_b):
            return CollisionResult(collider=rb, normal=direction)

    def to_dict(self):
        return { "pos": self.pos.to_dict(), "type": self.type, "id": self.id, "shape": {} if self.shape is None else self.shape.to_dict() }

    def process(self):
        pass

    def on_collision(self, dir: Vec3, collision: CollisionResult):
        pass

class Area(Body):
    def __init__(self, *, pos=Vec3(), shape=None):
        super().__init__(type="Area", body_type=BodyType.AREA, pos=pos, shape=shape)

    def process(self):
        res = self.scene.test_collision(self)

        if res:
            self.body_entered(res.collider)

    def body_entered(self, body):
        pass

class State(enum.Enum):
    IN_LOBBY = 0
    STARTED = 1
    ENDED = 2
    DEAD = 3

class Game:
    def __init__(self, *, tid: str = None):
        self.manager = None
        self.id = ""
        self.clients: list[Client] = []
        self.scene = Scene()
        self.state = State.IN_LOBBY
        self.tid = tid

    def is_tournament_game(self) -> bool:
        return self.tid is not None

    def start(self):
        self.task = asyncio.create_task(self.run())

    async def run(self):
        while self.state != State.DEAD:
            await self.on_update()
            await asyncio.sleep(0.010)

        log(f"Game with id {self.id} exited")
        self.manager.games.pop(self.id)

    async def broadcast(self, data):
        consumers = filter(lambda conn: self.get_client(conn.player.id, None) is not None, self.manager.consumers)

        for consumer in consumers:
            await consumer.send(json.dumps(data))

    def get_client(self, id: int, subid=None) -> Client:
        try:
            return next(filter(lambda c: c.id == id and (subid is None or c.subid == subid), self.clients))
        except StopIteration:
            return None

    #
    # Callbacks
    #

    async def on_join(self, gamemode: str, player_id: int) -> bool:
        pass

    async def on_unhandled_message(self, msg):
        pass

    async def on_update(self):
        pass

class ServerManager:
    def __init__(self, ty):
        self.games = {}
        self.consumers = []
        self.ty = ty

    def get_game(self, player_id: int) -> Game:
        for id in self.games:
            game = self.games[id]

            for client in game.clients:
                if client.id == player_id:
                    return game
        return None

    def make_id(self, k=8) -> str:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

    def start_game(self, *, gamemode: str, tid: str=None, acceptedPlayers: list[int]=None):
        id = self.make_id()

        game = self.ty(gamemode=gamemode, tid=tid, acceptedPlayers=acceptedPlayers)
        game.id = id
        game.manager = self

        self.games[id] = game

        log(f"Game started with id", game.id)
        game.start()
        return game

    def disconnect(self, consumer):
        self.consumers.remove(consumer)

    def already_in_game(self, conn) -> bool:
        return self.get_game(conn.player.id) is not None

    #
    # Error messages
    #

    async def err_already_in_game(self, conn):
        await conn.send(json.dumps({ "error": ALREADY_IN_GAME }))

    #
    # Callbacks
    #

    async def do_matchmaking(self) -> Game:
        return None

    async def on_join(self, conn) -> bool:
        return False

class TournamentGame:
    def __init__(self, *, player1: int, player2: int):
        self.player1 = player1
        self.player2 = player2

    def to_dict(self) -> any:
        return { "player1": self.player1, "player2": self.player2 }

class TournamentRound:
    def __init__(self, n: int):
        self.games: list[TournamentGame] = []

        for i in range(n):
            self.games.append(TournamentGame(player1=None, player2=None))

    def to_dict(self) -> any:
        return { "games": [ game.to_dict() for game in self.games ] }

class TournamentW:
    def __init__(self, gameManager, manager, tid: str, playerCount: int, privacy: str, password: str, game: str, gameSettings, fillWithAI: bool):
        self.manager = manager
        self.gameManager = gameManager
        self.tid = tid
        self.playerCount = playerCount
        self.privacy = privacy
        self.password = password
        self.game = game
        self.gameSettings = gameSettings
        self.fillWithAI = fillWithAI

        self.players = []
        self.rounds: list[TournamentRound] = []
        self.currentRound = 0

        # Create the empty tournament tree

        n = self.playerCount // 2

        while n > 0:
            self.rounds.append(TournamentRound(n))
            n //= 2

    async def on_join(self, player):
        self.players.append(player.id)
        await self.broadcast(json.dumps({ "type": "players", "players": self.players }))
        await self.send_tree()

    async def disconnect(self, player):
        self.players.remove(player.id)
        await self.broadcast(json.dumps({ "type": "players", "players": self.players }))

    async def send_tree(self):
        await self.broadcast(json.dumps({ "type": "rounds", "rounds": [round.to_dict() for round in self.rounds] }))

    async def broadcast(self, msg: str):
        """
        Send a message to all clients
        """

        for c in self.manager.all_players(self.tid):
            await c.send(msg)

    async def send_to(self, id: int, msg: str):
        await self.manager.get_player(id).send(msg)

    def shuffle_players(self):
        r = self.rounds[0]
        s = [id for id in self.players]

        for game in r.games:
            game.player1 = s[random.randint(0, len(s) - 1)]
            s.remove(game.player1)
            game.player2 = s[random.randint(0, len(s) - 1)]
            s.remove(game.player2)

    async def start(self):
        if len(self.players) != self.playerCount:
            return

        self.shuffle_players()
        await self.send_tree()

        r = self.rounds[self.currentRound]

        for tgame in r.games:
            game: Game = self.gameManager.start_game(gamemode="1v1", tid=self.tid, acceptedPlayers=[tgame.player1, tgame.player2])

            await game.on_join("1v1", tgame.player1)
            await game.on_join("1v1", tgame.player2)

            await self.send_to(tgame.player1, json.dumps({ "type": "match", "id": game.id }))
            await self.send_to(tgame.player2, json.dumps({ "type": "match", "id": game.id }))

class TournamentManager:
    def __init__(self, *, game: str, manager: ServerManager):
        self.game = game
        self.manager = manager

        self.tournaments: list[TournamentW] = {}
        self.consumers = []

        # Let's read the database and restore all ongoing tournaments

    def create(self, *, gameManager, name: str, playerCount: int, privacy: str, password: str = None, fillWithAI: bool, gameSettings) -> str:
        """
        Create a new tournament
        """

        tid = make_id()
        hashed_password = hash_weak_password(password) if password is not None else None

        # t = sync(lambda: Tournament(name=name, tid=tid, playerCount=playerCount, openType=privacy, password=hashed_password, game=self.game, gameSettings=gameSettings, fillWithAI=fillWithAI, state="lobby"))
        # sync(lambda: t.save())

        t2 = TournamentW(gameManager=gameManager, manager=self, tid=tid, playerCount=playerCount, privacy=privacy, password=hashed_password, game=self.game, gameSettings=gameSettings, fillWithAI=fillWithAI)
        self.tournaments[tid] = t2

        return tid

    async def on_join(self, player: Player, tid: str, password: str) -> bool:
        if tid not in self.tournaments:
            return False

        t = self.tournaments[tid]

        if t.privacy == "password" and (password is None or hash_weak_password(password) != t.password):
            return False

        if t.privacy == "invite":
            # TODO: Check if the player has been invited to the tournament
            return False

        await t.on_join(player)
        return True

    async def connect(self, consumer):
        self.consumers.append(consumer)

    async def disconnect(self, tid, consumer):
        if tid not in self.tournaments:
            return

        self.consumers.remove(consumer)
        player = consumer.player

        t = self.tournaments[tid]
        await t.disconnect(player)

    async def start(self, tid: str):
        if tid not in self.tournaments:
            return

        t = self.tournaments[tid]
        await t.start()

    def all_players(self, tid: str):
        return filter(lambda v: v.tid == tid, self.consumers)

    def get_player(self, id: int):
        try:
            return next(filter(lambda v: v.player.id == id, self.consumers))
        except StopIteration:
            return None

def sync(f, *args):
    pool = ThreadPool(processes=1)
    return pool.apply_async(f, *args).get()

import sys
import os
import json
import math
from .gameframework import log, Game, ServerManager, Vec3, Box, Sphere, Body, Scene, Client, BodyType

class Player(Body):
    speed = 0.1

    def __init__(self, name: str, client: Client):
        super().__init__(name=name,shape=Box(Vec3(-0.5, -2.5, 0), Vec3(0.5, 2.5, 0)), client=client)

    def process(self):
        if self.client.is_pressed("up"):
            self.move_up()
        if self.client.is_pressed("down"):
            self.move_down()

    def move_up(self):
        self.pos.y += self.speed

    def move_down(self):
        self.pos.y -= self.speed

class Ball(Body):
    speed = 0.1

    def __init__(self):
        super().__init__(name="Ball", shape=Sphere(0.5), type=BodyType.DYNAMIC)
        self.last_collision = None
        self.velocity = Vec3(Ball.speed, 0, 0)
        self.bounce = 1.0

    def process(self):
        self.try_move()

class Pong(Game):
    def __init__(self):
        super().__init__()

        self.clients["player1"] = Client("player1")
        self.clients["player2"] = Client("player2")

        self.player1 = Player("player1", self.clients["player1"])
        self.player1.pos = Vec3(-4, 0, 0)
        self.player2 = Player("player2", self.clients["player2"])
        self.player2.pos = Vec3(4, 0, 0)

        self.ball = Ball()
        self.ball.pos = Vec3(0, 0, 0)

        self.scene.add_body(self.player1)
        self.scene.add_body(self.player2)
        self.scene.add_body(self.ball)

        border_box = Box(Vec3(-10, -0.2, 0), Vec3(10, 0.2, 0))

        self.scene.add_body(Body(name="Border", shape=border_box, pos=Vec3(0, -5, 0)))
        self.scene.add_body(Body(name="Border", shape=border_box, pos=Vec3(0, 5, 0)))

    async def on_update(self):
        self.scene.update()
        await self.broadcast({ "type": "update", "id": self.id, "bodies": self.scene.to_dict() })

    def on_unhandled_message(self, msg):
        pass

class PongServer(ServerManager):
    def do_matchmaking(self, conn, mode: str):
        game = Pong()
        self.start_game(conn, game)
        return game

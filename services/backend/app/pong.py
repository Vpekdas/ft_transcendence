import sys
import os
import json
import math
from .gameframework import log, Game, ServerManager, Vec3, Box, Sphere, Body, Scene, Client, BodyType, Area, CollisionResult

class Player(Body):
    speed = 0.2

    def __init__(self, name: str, client: Client):
        super().__init__(type="Player", shape=Box(Vec3(-0.5, -2.5, 0), Vec3(0.5, 2.5, 0)), client=client)
        self.id = name
        self.score = 0

    def process(self):
        if self.client.is_pressed("up"):
            self.move_up()
        if self.client.is_pressed("down"):
            self.move_down()

        self.try_move()
        self.velocity = Vec3()

    def move_up(self):
        self.velocity.y += self.speed

    def move_down(self):
        self.velocity.y -= self.speed

    def on_collision(self, dir: Vec3, collision: CollisionResult):
        collision.collider.velocity = self._bounce_vec(-collision.normal, dir, collision.collider.bounce) * Ball.speed

class Ball(Body):
    speed = 0.3

    def __init__(self):
        super().__init__(type="Ball", shape=Sphere(0.5, Vec3()), body_type=BodyType.DYNAMIC)
        self.last_collision = None
        self.velocity = Vec3(1, -1, 0).normalized() * Ball.speed
        self.bounce = 1.0

    def process(self):
        self.try_move()

    def on_collision(self, dir: Vec3, collision: CollisionResult):
        self.velocity = self._bounce_vec(collision.normal, dir, self.bounce) * self.speed

class ScoreArea(Area):
    def __init__(self, *, player=None, pos=Vec3(), game=None):
        super().__init__(pos=pos, shape=Box(min=Vec3(-1, -12.2, 0.5), max=Vec3(1, 12.2, 0.5)))
        self.player = player
        self.game = game

    def body_entered(self, body):
        self.player.score += 1
        self.game.reset()

class Settings:
    def __init__(self, *, max_score=9):
        self.max_score = max_score

class Pong(Game):
    def __init__(self):
        super().__init__()

        self.settings = Settings()
        self.service = 0
        self.players_count = 2

        self.clients["player1"] = Client("player1")
        self.clients["player2"] = Client("player2")

        self.player1 = Player("player1", self.clients["player1"])
        self.player1.pos = Vec3(-17, 0, 0)
        self.player2 = Player("player2", self.clients["player2"])
        self.player2.pos = Vec3(17, 0, 0)

        self.ball = Ball()
        self.ball.pos = Vec3(0, 0, 0)

        self.score1 = ScoreArea(player=self.player2, pos=Vec3(-19, 0, 0), game=self)
        self.score2 = ScoreArea(player=self.player1, pos=Vec3(19, 0, 0), game=self)

        self.scene.add_body(self.score1)
        self.scene.add_body(self.score2)

        self.scene.add_body(self.player1)
        self.scene.add_body(self.player2)
        self.scene.add_body(self.ball)

        border_box = Box(Vec3(-18, -0.2, 0), Vec3(18, 0.2, 0))

        self.scene.add_body(Body(type="Wall", shape=border_box, pos=Vec3(0, -12, 0)))
        self.scene.add_body(Body(type="Wall", shape=border_box, pos=Vec3(0, 12, 0)))

    def reset(self):
        self.player1.pos.y = 0
        self.player2.pos.y = 0
        self.ball.pos = Vec3(0, 0, 0)

        if self.service == 1:
            self.ball.velocity = Vec3(1, -1, 0).normalized() * Ball.speed
        else:
            self.ball.velocity = Vec3(-1, -1, 0).normalized() * Ball.speed

        if self.service == 1: self.service = 0
        else: self.service = 1

        if self.score1 == self.settings.max_score:
            pass

    async def on_update(self):
        self.scene.update()
        await self.broadcast({ "type": "update", "bodies": self.scene.to_dict(), "scores": [ self.player1.score, self.player2.score ] })

    def on_unhandled_message(self, msg):
        pass

class PongServer(ServerManager):
    def do_matchmaking(self, conn, mode: str):
        game = Pong()
        self.start_game(conn, game)
        return game

import sys
import os
import json
import math
from gameframework import log, Game, GameServer, Vec3, Box, Sphere, Body, Scene, Client, BodyType

class Player(Body):
    speed = 0.1

    def __init__(self, client: Client):
        super().__init__(shape=Box(Vec3(-0.5, -5, 0), Vec3(0.5, 5, 0)), client=client)

    def process(self):
        if self.client.is_pressed("up"):
            self.move_up()
        if self.client.is_pressed("down"):
            self.move_down()

    def move_up(self):
        self.pos.y += self.speed

    def move_down(self):
        self.pos.y -= self.speed

    def to_dict(self):
        return { "pos": self.pos.to_dict() }

class Ball(Body):
    speed = 0.1

    def __init__(self):
        super().__init__(shape = Sphere(0.5), type=BodyType.DYNAMIC)
        self.last_collision = None
        self.velocity = Vec3(Ball.speed, 0, 0)

    def process(self):
        self.try_move()

    def to_dict(self):
        return { "pos": self.pos.to_dict() }

class Pong(Game):
    def __init__(self):
        super().__init__()

        self.clients["player1"] = Client("player1")
        self.clients["player2"] = Client("player2")

        self.player1 = Player(self.clients["player1"])
        self.player1.pos = Vec3(-4, 0, 0)
        self.player2 = Player(self.clients["player2"])
        self.player2.pos = Vec3(4, 0, 0)

        self.ball = Ball()
        self.ball.pos = Vec3(0, 0, 0)

        self.scene.add_body(self.player1)
        self.scene.add_body(self.player2)
        self.scene.add_body(self.ball)

    async def on_update(self):
        self.scene.update()
        await self.broadcast(json.dumps({ "type": "update", "id": self.id, "player1": self.player1.to_dict(), "player2": self.player2.to_dict(), "ball": self.ball.to_dict() }))

    async def on_unhandled_message(self, msg):
        pass

class PongServer(GameServer):
    async def do_matchmaking(self, conn, mode: str):
        game = Pong()
        await self.start_game(conn, game)
        return game

def main():
    serve = PongServer()
    serve.serve_forever()

if __name__ == '__main__':
    main()

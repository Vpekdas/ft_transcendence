import sys
import os
import json
from gameframework import log, Game, GameServer, Vec3, Box, Sphere, Body, Scene, Client

class Player(Body):
    speed = 3

    def __init__(self, client: Client):
        self.client = client
        self.shape = Box(Vec3(-10, -125, 0), Vec3(10, 125, 0))

    def process(self):
        if self.client.is_pressed("up"):
            self.move_up()
        if self.client.is_pressed("down"):
            self.move_down()

    def move_up(self):
        self.pos.y -= self.speed
        self.pos.y = self.pos.y if self.pos.y >= 125 else 125

    def move_down(self):
        self.pos.y += self.speed
        self.pos.y = self.pos.y if self.pos.y <= 780 - 125 else 780 - 125

    def to_dict(self):
        return { "pos": self.pos.to_dict() }

class Ball(Body):
    speed = 10

    def __init__(self):
        self.shape = Sphere(30)
        self.last_collision = None

    def process(self):
        if self.last_collision is not None:
            self.velocity.x = -self.velocity.x
            log(self.velocity)

        self.last_collision = self.try_move()

    def to_dict(self):
        return { "pos": self.pos.to_dict() }

class Pong(Game):
    def __init__(self):
        super().__init__()

        self.clients["player1"] = Client("player1")
        self.clients["player2"] = Client("player2")

        self.player1 = Player(self.clients["player1"])
        self.player1.pos = Vec3(10, 780 / 2, 0)
        self.player2 = Player(self.clients["player2"])
        self.player2.pos = Vec3(1920 - 10, 400, 0)

        self.ball = Ball()
        self.ball.pos = Vec3(1920 / 2, 780 / 2, 0)
        self.ball.velocity = Vec3(10, 0, 0)

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

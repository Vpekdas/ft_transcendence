import sys
import os
import asyncio
import json
from gameframework import log, Game, GameServer, Vec3

class Player:
    pos = Vec3()
    speed = 10

    def move_up(self):
        self.pos.y -= self.speed
        self.pos.y = self.pos.y if self.pos.y >= 125 else 125

    def move_down(self):
        self.pos.y += self.speed
        self.pos.y = self.pos.y if self.pos.y <= 780 - 125 else 780 - 125

    def to_dict(self):
        return { "pos": self.pos.to_dict() }

class Ball:
    pos = Vec3()
    speed = 10

    def to_dict(self):
        return { "pos": self.pos.to_dict() }

class Pong(Game):
    player1: Player
    player2: Player
    ball: Ball

    def __init__(self):
        self.player1 = Player()
        self.player1.pos = Vec3(0, 125 + 40, 0)
        self.player2 = Player()
        self.player2.pos = Vec3(0, 400, 0)

        self.ball = Ball()
        self.ball.pos = Vec3(1920 / 2, 780 / 2, 0)

    async def on_update(self):
        await self.broadcast(json.dumps({ "type": "update", "id": self.id, "player1": self.player1.to_dict(), "player2": self.player2.to_dict(), "ball": self.ball.to_dict() }))

    async def on_message(self, msg):
        if "action" in msg:
            if msg["player"] == "player1":
                if msg["action"] == "move_up":
                    self.player1.move_up()
                elif msg["action"] == "move_down":
                    self.player1.move_down()
            elif msg["player"] == "player2":
                if msg["action"] == "move_up":
                    self.player2.move_up()
                elif msg["action"] == "move_down":
                    self.player2.move_down()

class PongServer(GameServer):
    async def do_matchmaking(self, mode: str):
        game = Pong()
        await self.start_game(game)
        return game

def main():
    serve = PongServer()
    serve.serve_forever()

if __name__ == '__main__':
    main()

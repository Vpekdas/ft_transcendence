import sys
import os
import asyncio
import json
from gameframework import log, Game, GameServer, Connection, Vec3

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

    async def on_update(self, ws):
        await ws.send(json.dumps({ "type": "update", "player1": self.player1.to_dict(), "player2": self.player2.to_dict(), "ball": self.ball.to_dict() }))

    async def on_message(self, ws, message):
        if "action" in message:
            if message["player"] == "player1":
                if message["action"] == "move_up":
                    self.player1.move_up()
                elif message["action"] == "move_down":
                    self.player1.move_down()
            elif message["player"] == "player2":
                if message["action"] == "move_up":
                    self.player2.move_up()
                elif message["action"] == "move_down":
                    self.player2.move_down()

class PongServer(GameServer):
    def do_matchmaking(self, conn: Connection, mode: str):
        game = Pong()
        id = self.start_game(game)
        return id

def main():
    httpd = PongServer(("0.0.0.0", 1972))
    httpd.serve_forever()

if __name__ == '__main__':
    main()

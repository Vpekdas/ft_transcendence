import sys
import os
import asyncio
import json
from gameframework import log, Game, GameServer

class Pong(Game):
    def __init__(self):
        log("Hello world!")

        self.playerY = 20

    async def on_message(self, ws, message):
        if "action" in message:
            if message["action"] == "move_up":
                self.playerY -= 1
                self.playerY = self.playerY if self.playerY >= 0 else 0
            elif message["action"] == "move_down":
                self.playerY += 1
                self.playerY = self.playerY if self.playerY <= 780 else 780

        await ws.send(json.dumps({ "player1": { "pos": { "y": self.playerY } } }))

class PongServer(GameServer):
    def on_create_game(self, data) -> bool:
        id = self.make_id()

        log("Creating new game with id", id)
        self.run_game(id, Pong())

        return id

def main():
    httpd = PongServer(("0.0.0.0", 1973))
    log("Listening on 0.0.0.0:1973")
    httpd.serve_forever()

if __name__ == '__main__':
    main()

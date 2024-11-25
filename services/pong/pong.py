import sys
import os
import asyncio
import json
from gameframework import log, Game

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

async def main():
    await Pong().run()

if __name__ == '__main__':
    asyncio.run(main())

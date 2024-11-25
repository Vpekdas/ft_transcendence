import sys
import os
import asyncio
from gameframework import log, Game

class Pong(Game):
    def __init__(self):
        log("Hello world!")

async def main():
    await Pong().run()

if __name__ == '__main__':
    asyncio.run(main())

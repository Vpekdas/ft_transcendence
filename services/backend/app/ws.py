import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .gameframework import log, ServerManager
from .pong import PongServer

server_manager = PongServer()

class ClientConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        server_manager.disconnect(self)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" in data and data["type"] == "matchmake" and "gamemode" in data:
                server_manager.do_matchmaking(self, data["gamemode"])
                await self.send(json.dumps({ "type": "waiting" }))
            elif "type" in data and data["type"] == "join":
                id = data["id"]

                if server_manager.on_join(id):
                    await self.send(json.dumps({ "type": "matchFound", "id": id }))
                else:
                    await self.send(json.dumps({ "type": "denied" }))
            else:
                game = server_manager.get_game(self)

                if data["type"] == "input":
                    client = game.get_client(data["player"])
                    if client is not None: client.on_input(data)
                else:
                    game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .gameframework import log, sync, ServerManager
from .pong import PongServer
from .models import Player
from asgiref.sync import sync_to_async

pong_manager = PongServer()

class ClientConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            self.player = sync(lambda: Player.objects.filter(user=self.user).first())
            pong_manager.consumers.append(self)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        pong_manager.disconnect(self)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" in data and data["type"] == "matchmake" and "gamemode" in data:
                await pong_manager.do_matchmaking(self, data)
            elif "type" in data and data["type"] == "join":
                await pong_manager.on_join(self)
            elif "type" in data:
                game = pong_manager.get_game(self.player.id)

                if game is None:
                    # The player is not currently in a game
                    # log("Receiving data from a player, but he is not in a game")
                    return

                if data["type"] == "input":
                    client = game.get_client(self.player.id, data["playerSubId"] if "playerSubId" in data else None)
                    if client is not None: client.on_input(data)
                else:
                    await game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

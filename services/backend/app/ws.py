import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .gameframework import log, ServerManager
from .pong import PongServer
from .models import Player

server_manager = PongServer()

@sync_to_async
def player_from(*, user):
    return Player.objects.filter(user=user).first()

class ClientConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            self.player = await player_from(user=self.user)
            server_manager.consumers.append(self)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        server_manager.disconnect(self)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" in data and data["type"] == "matchmake" and "gamemode" in data:
                await server_manager.do_matchmaking(self, data)
            elif "type" in data and data["type"] == "join":
                await server_manager.on_join(self)
            elif "type" in data:
                game = server_manager.get_game(self.player.gid)

                if data["type"] == "input":
                    log(data)
                    client = game.get_client(self.player.gid, data["playerSubId"] if "playerSubId" in data else None)
                    if client is not None: client.on_input(data)
                elif data["type"] == "join":
                    game.on_join(data)
                else:
                    game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

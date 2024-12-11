import json
from channels.generic.websocket import WebsocketConsumer
from .gameframework import log, ServerManager
from .pong import PongServer
from .models import Player

server_manager = PongServer()

class ClientConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            self.player = Player.objects.filter(user=self.user).first()
            server_manager.consumers.append(self)
            self.accept()
        else:
            self.close()

    def disconnect(self, close_code):
        server_manager.disconnect(self)

    def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" in data and data["type"] == "matchmake" and "gamemode" in data:
                server_manager.do_matchmaking(self, data)
            elif "type" in data and data["type"] == "join":
                server_manager.on_join(self)
            elif "type" in data:
                game = server_manager.get_game(self.player.gid)

                if data["type"] == "input":
                    client = game.get_client(self.player.gid, data["playerSubId"] if "playerSubId" in data else None)
                    if client is not None: client.on_input(data)
                else:
                    game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

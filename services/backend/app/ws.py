import json
from channels.generic.websocket import WebsocketConsumer
from .gameframework import log, ServerManager
from .pong import PongServer

server_manager = PongServer()

class ClientConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        server_manager.disconnect(self)

    def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" in data and data["type"] == "matchmake" and "gamemode" in data:
                game = server_manager.do_matchmaking(self, data["gamemode"])

                if game is not None:
                    self.send(json.dumps({ "type": "matchFound", "id": game.id }))
                else:
                    log("Something went wrong...")
            elif "id" in data:
                game = server_manager.get_game(self)

                if data["type"] == "input":
                    client = game.get_client(data["player"])
                    if client is not None: client.on_input(data)
                else:
                    game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

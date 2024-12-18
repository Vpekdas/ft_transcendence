import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .gameframework import log, sync, ServerManager, TournamentManager
from .pong import PongManager
from .models import Player, Tournament
from .views import hash_weak_password
from .errors import *
from asgiref.sync import sync_to_async

pong_manager = PongManager()
tournaments = TournamentManager(game="pong", manager=pong_manager)

class PongClientConsumer(AsyncWebsocketConsumer):
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
                    return

                if data["type"] == "input":
                    log(data)
                    client = game.get_client(self.player.id, data["playerSubId"] if ("playerSubId" in data) or (data["playerSubId"] is None) else None)
                    if client is not None: client.on_input(data)
                else:
                    await game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tid = self.scope["kwargs"]["id"]

        log("id =", self.tid)

        self.tournament = sync(lambda: Tournament.objects.filter(tid=self.tid).first())

        # TODO: Implement invite only

        if tournament.openType == "password":
            self.is_connected = False
        elif tournament.openType == "open":
            self.is_connected = True
        else:
            log("Tournament type not supported yet:", tournament.openType)

        self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" not in data:
                return

            if data["type"] == "connect":
                if hash_weak_password(data["password"]) == self.tournament.password:
                    self.is_connected = True
                else:
                    self.send(json.dumps({ "error": BAD_PASSWORD }))
        except json.JSONDecodeError:
            pass

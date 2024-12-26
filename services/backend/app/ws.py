import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .gameframework import log, sync, ServerManager, TournamentManager
from .pong import PongManager
from .models import Player, Tournament
from .utils import hash_weak_password
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
                await pong_manager.on_join(self, data["id"])
            elif "type" in data:
                game = pong_manager.get_game(self.player.id)

                if game is None:
                    # The player is not currently in a game
                    return

                if data["type"] == "input":
                    client = game.get_client(self.player.id, data["playerSubId"] if ("playerSubId" in data) or (data["playerSubId"] is None) else None)
                    if client is not None: client.on_input(data)
                else:
                    await game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        self.player = sync(lambda: Player.objects.filter(user=self.user).first())
        self.tid = self.scope["url_route"]["kwargs"]["id"]

        if self.tid not in tournaments.tournaments:
            await self.close()
            return

        self.tournament = tournaments.tournaments[self.tid]
        self.is_connected = False

        await tournaments.connect(self)
        await self.accept()

    async def disconnect(self, close_code):
        await tournaments.disconnect(self.tid, self)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" not in data:
                return

            if data["type"] == "join":
                if await tournaments.on_join(self.player, self.tid, data["password"] if "password" in data else None):
                    self.is_connected = True
                else:
                    await self.send(json.dumps({ "error": BAD_PASSWORD }))
            elif data["type"] == "start":
                await tournaments.start(self.tid)
        except json.JSONDecodeError:
            pass

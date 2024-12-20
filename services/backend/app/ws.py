import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .gameframework import log, sync, GameManager, TournamentManager, Client
from .pong import PongManager
from .models import Player, Tournament
from .utils import hash_weak_password
from .errors import *
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User

pong_manager = PongManager()
tournaments = TournamentManager(game="pong", manager=pong_manager)

class PongMatchmakeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        self.player = sync(lambda: Player.objects.filter(user=self.user).first())
        await self.accept()

    async def disconnect(self, close_code):
        await pong_manager.on_quit(self.player)
        await self.close()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" not in data:
                return

            if data["type"] == "request" and "gamemode" in data:
                await pong_manager.do_matchmaking(self, data["gamemode"], self.player)
        except json.JSONDecodeError:
            pass

class PongClientConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        self.game_id = self.scope["url_route"]["kwargs"]["id"]
        self.game = pong_manager.get_game_by_id(self.game_id)

        if self.game is None:
            await self.close()
            return

        self.player = sync(lambda: Player.objects.filter(user=self.user).first())
        self.game.connect(self)

        if await self.game.on_join(self.player.id):
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.game is not None:
            self.game.disconnect(self)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            client: Client = None

            if "type" in data:
                if data["type"] == "input":
                    if self.game.gamemode == "1v1local" and "playerSubId" in data:
                        client = self.game.get_client(self.player.id, data["playerSubId"])
                    else:
                        client = self.game.get_client(self.player.id, None)
                    if client is not None: client.on_input(data)
                elif data["type"] == "ready" and "params" in data:
                    if self.game.gamemode == "1v1local" and "playerSubId" in data:
                        client = self.game.get_client(self.player.id, data["playerSubId"])
                    else:
                        client = self.game.get_client(self.player.id, None)
                    if client is not None: self.game.on_client_ready(client, params)
                else:
                    await self.game.on_unhandled_message(data)
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
            elif data["type"] == "start" and self.player.id == self.tournament.host:
                await tournaments.start(self.tid)
        except json.JSONDecodeError:
            pass

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
            self.room_group_name = f"chat_{self.room_name}"

            # Join the room group
            self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            self.accept()
        else:
            self.close()

    def disconnect(self, close_code):
        # Leave the room group
        self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" in data and data["type"] == "message" and "content" in data:
                message_content = data["content"]
                room = ChatRoom.objects.get(name=self.room_name)

                # Save the message in the database
                message = Message.objects.create(
                    room=room,
                    user=self.user,
                    content=message_content
                )

                # Broadcast the message to the room group
                self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": {
                            "user": self.user.username,
                            "content": message_content,
                            "timestamp": str(message.timestamp)
                        }
                    }
                )
        except json.JSONDecodeError:
            pass

    def chat_message(self, event):
        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "message",
            "user": event["message"]["user"],
            "content": event["message"]["content"],
            "timestamp": event["message"]["timestamp"]
        }))
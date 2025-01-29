import json
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from .gameframework import log, sync, GameManager, TournamentManager, Client
from .pong import PongManager
from .chess import ChessGame
from .models import Player, Tournament
from .utils import hash_weak_password
from .errors import *
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

import uuid

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
                    if client is not None: self.game.on_client_ready(client, data["params"])
                else:
                    await self.game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

chess_game = ChessGame()

class ChessClientConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "type" not in data:
                return
            
            await chess_game.on_message(self, data)
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

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = self.scope['url_route']['kwargs']['room_name']
        self.channel_name = self.channel_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Retrieve the Player instance
        user = self.scope["user"]
        player = await sync_to_async(Player.objects.get)(user=user)

        # Send the channelList to the frontend
        await self.send(text_data=json.dumps({
            'type': 'channel_list',
            'channelList': player.channelList,
            'discussingWith': player.discussingWith
            
        }))

    async def disconnect(self, close_code):
        # Log the disconnection
        print(f"User {self.scope['user']} disconnected from {self.room_group_name}")

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Retrieve the Player instance
        user = self.scope["user"]
        player = await sync_to_async(Player.objects.get)(user=user)

        # Notify other clients about the disconnection
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_disconnected',
                'message': f'User {user.username} has disconnected.'
            }
        )

        # Save the updated Player instance
        await sync_to_async(player.save)()

    async def user_disconnected(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'user_disconnected',
            'message': message
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "create_channel":
            await self.create_channel(data)
        elif message_type == "send_message":
            await self.send_message(data)

    async def create_channel(self, data):
        # Generate a unique channel name.
        new_channel_name = str(uuid.uuid4())
        userlist = data.get("userlist")

        # Broadcast the new channel information to all users in the general channel.
        await self.channel_layer.group_send(
            "general",
            {
                "type": "channel_created",
                "channel_name": new_channel_name,
                "userlist": userlist
            }
        )

        # Update the Player instance for each user in the userlist
        for username in userlist:
            user = await sync_to_async(get_user_model().objects.get)(username=username)
            player = await sync_to_async(Player.objects.get)(user=user)
    
            # Find the other user in the userlist
            other_user = next(u for u in userlist if u != username)
            other_user_instance = await sync_to_async(get_user_model().objects.get)(username=other_user)
            other_player = await sync_to_async(Player.objects.get)(user=other_user_instance)
    
            # Append the new channel URL and the other user's nickname to the respective lists
            player.channelList.append(new_channel_name)
            player.discussingWith.append(other_player.nickname)
    
            # Save the updated Player instance
            await sync_to_async(player.save)()


    # Handle channel creation request with a given userlist.
    async def channel_created(self, event):
        channel_name = event["channel_name"]
        userlist = event["userlist"]

        await self.send(text_data=json.dumps({
            "type": "channel_created",
            "channel_name": channel_name,
            "userlist": userlist
        }))

    async def send_message(self, data):
        message = data.get("content")
        sender = data.get("sender")
        channel_name = data.get("channel_name")  


        await self.channel_layer.group_send(
            channel_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": sender,
                "timestamp": ""  
            }
        )

    async def chat_message(self, event):
        message = event["message"]
        sender = event["sender"]
        timestamp = event["timestamp"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": message,
            "sender": sender,
            "timestamp": timestamp
        }))
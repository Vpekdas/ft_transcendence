import json
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from .gameframework import log, sync, GameManager, TournamentManager, Client
from .pong import PongManager
from .chess import ChessGame
from .models import Player, Tournament, Chat, Message
from .utils import hash_weak_password
from .errors import *
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from django.utils import timezone

import uuid
# import logging


# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# logger = logging.getLogger(__name__)


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
                if not pong_manager.has_watcher_started(): pong_manager.start_watcher()

                await pong_manager.do_matchmaking(self, data["gamemode"], self.player, opponent=data["opponent"] if "opponent" in data else None)
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
                else:
                    await self.game.on_unhandled_message(data)
        except json.JSONDecodeError:
            pass

chess_game = ChessGame()

class ChessClientConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await chess_game.on_join(self)

    async def disconnect(self, close_code):
        await chess_game.on_quit(self)

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
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        self.user_id = self.user.id 

        await self.set_player_online(self.user.id)

        # Join room group.
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        player = await sync_to_async(Player.objects.get)(user=self.user)

        await self.send(text_data=json.dumps({
            'type': 'channel_list',
            'channelList': player.channelList,
            'discussingWith': player.discussingWith

        }))

        await self.channel_layer.group_send(
            "general",
            {
                'type': 'user_status',
                'user': self.user_id,
                'status': 'online'
            }
        )

        online_users = await self.get_online_users()
        await self.send(text_data=json.dumps({
            'type': 'online_users',
            'online_users': online_users
        }))

    async def disconnect(self, close_code):
        if not self.user.is_authenticated:
            await self.close()
            return

        await self.set_player_offline(self.user.id)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            "general",
            {
                'type': 'user_status',
                'user': self.user.id,
                'status': 'offline'
            }
        )
        
        online_users = await self.get_online_users()
        await self.channel_layer.group_send(
            "general",
            {
                'type': 'online_users',
                'online_users': online_users
            }
        )

        await self.close()


    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if not self.user.is_authenticated:
            await self.close()
            return

        if "type" not in data:
            return

        if message_type == "create_channel":
            await self.create_channel(data)
        elif message_type == "send_message":
            await self.send_message(data)
        elif message_type == "create_game":
            await self.create_game(data)

    async def create_game(self, data):
        accepted_user = data.get("user_list")
        channel_name = data.get("channel_name")
    
        accepted_user = list(map(int, accepted_user))

        game = pong_manager.start_game(gamemode="1v1invite")
        game.accepted_players = accepted_user

        # await self.channel_layer.group_send(
        #     channel_name,
        #     {
        #         "type": "create_game",
        #         "game_id": game.id
        #     }
        # )

        await self.send(text_data=json.dumps({
                "type": "create_game",
                "game_id": game.id
        }))

    async def create_channel(self, data):
        # Generate a unique channel name.
        new_channel_name = str(uuid.uuid4())
        userlist = data.get("userlist")
    
        # Ensure all users exist.
        for user_id in userlist:
            user_exists = await sync_to_async(get_user_model().objects.filter(id=user_id).exists)()
            if not user_exists:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'User with ID {user_id} does not exist'
                }))
                return
    
        # Check if the users are already discussing with each other and update their lists.
        for user_id in userlist:
            player = await sync_to_async(Player.objects.get)(user__id=user_id)
            for other_user_id in userlist:
                if other_user_id == user_id:
                    continue
                other_player = await sync_to_async(Player.objects.get)(user__id=other_user_id)
    
                # Check if the users are already discussing with each other.
                if other_player.id in player.discussingWith:
                    continue 
                
                # Append the new channel URL and the other user's ID to the respective lists if not already present.
                if new_channel_name not in player.channelList:
                    player.channelList.append(new_channel_name)
                if other_player.id not in player.discussingWith:
                    player.discussingWith.append(other_player.id)
    
            await sync_to_async(player.save)()
    
        await self.channel_layer.group_send(
            "general",
            {
                "type": "channel_created",
                "channel_name": new_channel_name,
                "userlist": userlist
            }
        )

    async def send_message(self, data):
        message_text = data.get("content")
        sender_id = data.get("sender")
        receiver_id = data.get("receiver")
        channel_name = data.get("channel_name")

        if not message_text or not sender_id or not receiver_id or not channel_name:
            return

        sender = await sync_to_async(Player.objects.get)(user__id=sender_id)
        receiver = await sync_to_async(Player.objects.get)(user__id=receiver_id)


        if await sync_to_async(receiver.blockedUsers.filter(id=sender.id).exists)():
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "You are blocked by this user."
            }))
            return

        if await sync_to_async(sender.blockedUsers.filter(id=receiver.id).exists)():
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "You have blocked this user."
            }))
            return

        chat, created = await sync_to_async(Chat.objects.get_or_create)(
            channel_name=channel_name
        )

        message = await sync_to_async(Message.objects.create)(
            content=message_text, 
            timestamp=timezone.now(), 
            sender=sender, 
            receiver=receiver
        )

        await sync_to_async(chat.messages.add)(message)

        await self.channel_layer.group_send(
            channel_name,
            {
                "type": "chat_message",
                "message": message_text,
                "sender": sender_id,
                "receiver": receiver_id,
                "timestamp": message.timestamp.isoformat()
            }
        )

    async def channel_created(self, event):
        channel_name = event["channel_name"]
        userlist = event["userlist"]

        if not channel_name or not userlist:
            return
    
        player1 = await sync_to_async(Player.objects.get)(user__id=userlist[0])
        player2 = await sync_to_async(Player.objects.get)(user__id=userlist[1])
    
        chat, created = await sync_to_async(Chat.objects.get_or_create)(
            channel_name=channel_name
        )
    
        await self.send(text_data=json.dumps({
            "type": "channel_created",
            "channel_name": channel_name,
            "userlist": userlist
        }))

    async def chat_message(self, event):
        message = event["message"]
        sender = event["sender"]
        receiver = event["receiver"]
        timestamp = event["timestamp"]

        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": message,
            "sender": sender,
            "receiver": receiver,
            "timestamp": timestamp
        }))

    async def user_status(self, event):
        user = event['user']
        status = event['status']

        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user': user,
            'status': status
        }))

    # Maybe code the online_users here for more consistency.
    async def online_users(self, event):
        pass


    @database_sync_to_async
    def set_player_online(self, user_id):
        player = Player.objects.get(user_id=user_id)
        player.is_online = True
        player.save()
    
    @database_sync_to_async
    def set_player_offline(self, user_id):
        player = Player.objects.get(user_id=user_id)
        player.is_online = False
        player.save()
    
    @database_sync_to_async
    def get_online_users(self):
        return list(Player.objects.filter(is_online=True).values_list('user_id', flat=True))
    

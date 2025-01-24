import sys
import json
import random
import string

import django
import base64
import hashlib
import requests
import os

from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, HttpResponseRedirect, HttpResponseServerError
from django.http.request import HttpRequest
from django.views.decorators.http import require_POST

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from .models import duck, Player, Tournament, PongGameResult, Chat, Message
from .errors import *
from .ws import tournaments, pong_manager

"""
Create a new user.
"""
@require_POST
def signin(request: HttpRequest):
    data = json.loads(request.body)

    if not "username" in data or not "password" in data or not "nickname" in data:
        return HttpResponseBadRequest()

    username = data["username"]
    password = data["password"]
    nickname = data["nickname"]

    if User.objects.filter(username=username).count() > 0:
        return JsonResponse({"error": ALREADY_IN_GAME})

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, nickname=nickname)

    user.set_password(password)
    user.save()

    login(request, user)

    return JsonResponse({})

CLIENT_ID="u-s4t2ud-113d89636c434e478745914966fff13deb2d93ec00210a1f8033f12f8e0d06b2"

"""
Create a new user using 42 API
"""
@require_POST
def signinExternal(request: HttpRequest):
    data = json.loads(request.body)

    code = data["code"]

    # Exchange the code provided by the api for an access token
    res = requests.post("https://api.intra.42.fr/oauth/token", json={ "grant_type": "authorization_code", "client_id": CLIENT_ID, "client_secret": os.environ.get("API42_SECRET"), "code": code })

    if res.status_code != 200:
        return HttpResponseServerError()

    response = json.loads(res.content)
    print(response, file=sys.stderr)

    # One last request to query the login, profile picture and other basic info to fill the database
    # https://api.intra.42.fr/v2/me

    # user = User.objects.create(username=username)
    # player = Player.objects.create(user=user, nickname=nickname, external=True)

    # user.save()

    # login(request, user)

    return JsonResponse({})

"""
Log-in
"""
@require_POST
def loginRoute(request: HttpRequest):
    data = json.loads(request.body)

    if not "username" in data or not "password" in data:
        return HttpResponseBadRequest()

    username = data["username"]
    password = data["password"]

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({ })
    else:
        return JsonResponse({ "error": MISMATCH_CREDENTIALS })

"""
Logout from an account.
"""
@require_POST
def logoutRoute(request: HttpRequest):
    logout(request)
    return JsonResponse({})

"""
Check if the user is logged in
"""
@require_POST
def isLoggedIn(request: HttpRequest):
    if request.user.is_authenticated:
        return JsonResponse({})
    else:
        return JsonResponse({ "error": NOT_LOGGED_IN })

"""
Update the password
"""
@require_POST
def updatePassword(request: HttpRequest, id):
    if request.user.is_authenticated:
        data = json.loads(request.body)

        oldPassword = data["oldPassword"]
        newPassword = data["newPassword"]

        if oldPassword is None or newPassword is None:
            return HttpResponseBadRequest()

        user = authenticate(username=request.user.username, password=oldPassword)

        # if user is None:
        #     return JsonResponse({ "error": "Invalid password" })

        request.user.set_password(newPassword)
        request.user.save()

        return JsonResponse({})
    else:
        return JsonResponse({ "error": NOT_AUTHENTICATED })

"""
Update a nickname
"""
@require_POST
def updateNickname(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": NOT_AUTHENTICATED })

    data = json.loads(request.body)

    newNickname = data["nickname"]

    player = Player.objects.filter(user=request.user).first()
    if not player:
        return JsonResponse({ "error": INTERNAL_ERROR })

    player.nickname = newNickname
    player.save()

    return JsonResponse({})

def invalid_user_id():
    return JsonResponse({ "error": INVALID_USER_ID })

@require_POST
def getNickname(request: HttpRequest, id):
    if id == "c" and request.user.is_authenticated:
        return JsonResponse({ "nickname": Player.objects.filter(user=request.user).first().nickname })
    else:
        p = Player.objects.filter(id=int(id)).first()

        if p is None:
            return invalid_user_id()

        return JsonResponse({ "nickname": p.nickname })

"""
"""
@require_POST
def getPlayerProfile(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": NOT_AUTHENTICATED })

    data = json.loads(request.body)

    player = Player.objects.filter(user=request.user).first()

    return JsonResponse({
        "nickname": player.nickname,
        "money": player.money,
        "skins": player.skins,
        "pongElo": player.pongElo,
        "id": player.id,
    })

"""
Return the profile picture of a user
"""
def getProfilePicture(request: HttpRequest, id: str):
    if id == "c" and request.user.is_authenticated:
        id = int(Player.objects.filter(user=request.user).first().id)
    else:
        id = int(id)

    player = Player.objects.filter(id=id).first()

    if player.icon is None:
        return HttpResponse(duck, "image/svg+xml")

    icon = player.icon
    data = str(icon["data"])
    data = data[data.find(",") + 1:]

    bdata = base64.b64decode(data)

    return HttpResponse(bdata, icon["type"])

"""
Update profile picture
"""
@require_POST
def updateProfilePicture(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": NOT_AUTHENTICATED })

    data = json.loads(request.body)
    valid_types = [ "image/svg+xml", "image/png", "image/jpeg", "image/gif" ]

    if data["type"] not in valid_types:
        return JsonResponse({ "error": INVALID_IMAGE_FORMAT })

    # if len(data["image"]) > 250000:
    #     return JsonResponse({ "error": IMAGE_TOO_BIG })

    player = Player.objects.filter(user=request.user).first()
    player.icon = { "type": data["type"], "data": data["image"] }
    player.save()

    return JsonResponse({})

@require_POST
def deleteProfile(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": NOT_AUTHENTICATED })

    user = request.user
    user.delete()

    return JsonResponse({})

terrainSkins = [ "default-terrain", "brittle-hollow" ]
ballSkins = [ "default-ball" ]

@require_POST
def selectTerrainSkin(request: HttpRequest, id, name):
    if id == "c" and request.user.is_authenticated:
        id = int(Player.objects.filter(user=request.user).first().id)
    else:
        id = int(id)

    if name not in terrainSkins:
        return JsonResponse({ "error": INVALID_SKIN })

    player = Player.objects.filter(id=id).first()
    skins = player.skins

    if "terrain" in skins:
        skins.insert("terrain", name)

    return JsonResponse({})

@require_POST
def selectBallSkin(request: HttpRequest, id, name):
    if id == "c" and request.user.is_authenticated:
        id = int(Player.objects.filter(user=request.user).first().id)
    else:
        id = int(id)

    player = Player.objects.filter(id=id).first()

    if name not in ballSkins:
        return JsonResponse({ "error": INVALID_SKIN })

    player = Player.objects.filter(id=id).first()
    skins = player.skins

    if "ball" in skins:
        skins.insert("ball", name)

    return JsonResponse({})

@require_POST
def getMatch(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": NOT_AUTHENTICATED })

    # data = json.loads(request.body)
    player = Player.objects.filter(user=request.user)
    results = [r for r in PongGameResult.objects.all() if player.id in r.players]

    return JsonResponse({ "results": [json.loads(r) for r in results] })

# /api/tournament/create
@require_POST
def tournament_create(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": NOT_AUTHENTICATED })

    data = json.loads(request.body)
    player = Player.objects.filter(user=request.user).first()

    if "gameSettings" not in data or "playerCount" not in data or "openType" not in data or "game" not in data or "fillWithAI" not in data:
        print(data, file=sys.stderr)
        return JsonResponse({ "error": INVALID_REQUEST })

    if data["openType"] not in ["open", "invite", "password"] or data["playerCount"] not in [2, 4, 8, 16]:
        return JsonResponse({ "error": INVALID_REQUEST })

    game_settings = data["gameSettings"]
    manager = pong_manager # TODO: Modify this with data["game"]

    tid = tournaments.create(gameManager=pong_manager, host=player.id, name=data["name"], playerCount=data["playerCount"], privacy=data["openType"], password=data["password"] if "password" in data else None, fillWithAI=bool(data["fillWithAI"]), gameSettings=data["gameSettings"])

    return JsonResponse({ "id": tid })@require_POST
def addFriend(request: HttpRequest, friend_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": NOT_AUTHENTICATED})

    # Récupérer le joueur actuel
    player = Player.objects.filter(user=request.user).first()
    if not player:
        return JsonResponse({"error": INTERNAL_ERROR})

    # Récupérer le joueur ami
    friend = Player.objects.filter(id=friend_id).first()
    if not friend:
        return JsonResponse({"error": FRIEND_NOT_FOUND})

    # Ajouter l'ami
    player.friends.add(friend)

    return JsonResponse({"message": "Friend added successfully."})


@require_POST
def deleteFriend(request: HttpRequest, friend_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": NOT_AUTHENTICATED})

    # Récupérer le joueur actuel
    player = Player.objects.filter(user=request.user).first()
    if not player:
        return JsonResponse({"error": INTERNAL_ERROR})

    # Récupérer le joueur ami
    friend = Player.objects.filter(id=friend_id).first()
    if not friend:
        return JsonResponse({"error": FRIEND_NOT_FOUND})

    # Supprimer l'ami
    player.friends.remove(friend)

    return JsonResponse({"message": "Friend removed successfully."})


@require_POST
def sendMessage(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": NOT_AUTHENTICATED})

    # Récupérer le joueur actuel
    player = Player.objects.filter(user=request.user).first()
    if not player:
        return JsonResponse({"error": INTERNAL_ERROR})

    # Récupérer le destinataire
    p2 = Player.objects.filter(id=id).first()
    if not p2:
        return JsonResponse({"error": RECEIVER_NOT_FOUND})

    # Vérifier si un chat existe déjà ou en créer un
    chat, created = Chat.objects.get_or_create(
        player1=min(player, p2, key=lambda x: x.id),
        player2=max(player, p2, key=lambda x: x.id),
    )

    # Récupérer le contenu du message depuis le body de la requête
    data = json.loads(request.body)
    contenu = data.get("content")
    if not contenu:
        return JsonResponse({"error": "Message content is required."})

    # Créer le message
    message = Message.objects.create(content=contenu, sender=player, receiver=p2)

    # Ajouter le message au chat
    chat.messages.add(message)

    return JsonResponse({"message": "Message sent successfully."})


def getMessages(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": NOT_AUTHENTICATED})

    # Récupérer le joueur actuel
    player = Player.objects.filter(user=request.user).first()
    if not player:
        return JsonResponse({"error": INTERNAL_ERROR})

    # Récupérer le destinataire
    p2 = Player.objects.filter(id=id).first()
    if not p2:
        return JsonResponse({"error": FRIEND_NOT_FOUND})

    # Rechercher le chat entre les deux joueurs
    try:
        chat = Chat.objects.get(
            player1=min(player, p2, key=lambda x: x.id),
            player2=max(player, p2, key=lambda x: x.id),
        )
    except Chat.DoesNotExist:
        return JsonResponse({"error": CHAT_NOT_FOUND})

    # Récupérer les messages du chat
    messages = chat.messages.all().values("content", "sender__username", "receiver__username", "timestamp")

    return JsonResponse({"messages": list(messages)})

# @require_POST
# def tournament_info(request: HttpRequest, id: str):
#     t = Tournament.objects.filter(tid=id).first()

#     if t is None:
#         return JsonResponse({ "error": TOURNAMENT_DOESNT_EXISTS })

#     return JsonResponse({
#         "game": t.game,
#         "name": t.name,
#         "openType": t.name,
#         "state": t.state,
#     })

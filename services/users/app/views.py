import sys
import json

import django
import base64
import requests

from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.http.request import HttpRequest
from django.views.decorators.http import require_POST

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from app.models import Player, MatchmakingPlayer, duck

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
        return JsonResponse({"error": "Username is already taken"})

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, nickname=nickname)

    user.set_password(password)
    user.save()

    login(request, user)

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
        return JsonResponse({ "error": "Mismatch username and password" })

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
        return JsonResponse({ "error": "User is not logged in" })

"""
Update the password
"""
@require_POST
def updatePassword(request: HttpRequest):
    data = json.loads(request.body)

    oldPassword = data["oldPassword"]
    newPassword = data["newPassword"]

    if passwod is None:
        return HttpResponseBadRequest()

    if request.user.is_authenticated:
        user = authenticate(username=username, password=oldPassword)

        if user is None:
            return JsonResponse({ "error": "Invalid password" })

        user.set_password(newPassword)
        user.save()

        return JsonResponse({})
    else:
        return JsonResponse({ "error": "User is not authenticated" })

"""
Update a nickname
"""
@require_POST
def updateNickname(request: HttpRequest):
    data = json.loads(request.body)

    newNickname = data["nickname"]

    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    player = Player.objects.filter(user=request.user).first()
    if not player:
        return JsonResponse({"error": "Internal error"})

    player.nickname = newNickname
    player.save()

    return JsonResponse({})

"""
"""
@require_POST
def getPlayerProfile(request: HttpRequest):
    data = json.loads(request.body)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    player = Player.objects.filter(user=request.user).first()

    return JsonResponse({
        "nickname": player.nickname,
        "money": player.money,
        "skins": player.skins,
        "pongElo": player.pongElo,
    })

"""
Return the profile picture of a user
"""
def getProfilePicture(request: HttpRequest):
    if "nickname" not in request.GET:
        return HttpResponse(duck, content_type="image/svg+xml")

    player = Player.objects.filter(nickname=request.GET["nickname"]).first()


    if not player or player.icon is None:
        return HttpResponse(duck, content_type="image/svg+xml")

    return HttpResponse(base64.b64decode(player.icon["data"]), content_type=player.icon["type"])

"""
Update profile picture
"""
@require_POST
def updateProfilePicture(request: HttpRequest):
    data = json.loads(request.body)

    type = data["type"]
    image = data["image"]

    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    valid_types = [ "image/svg+xml", "image/png", "image/jpeg", "image/gif" ]

    if type not in valid_types:
        return JsonResponse({"error": "Invalid image format"})

    player = Player.objects.filter(user=request.user).first()
    player.icon = { "type": type, "data": image }

    player.save()

    return JsonResponse({})

"""
Enter the matchmaking
"""
@require_POST
def enterMatchmaking(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": "User is not authenticated" })

    data = json.loads(request.body)

    # game can be "pong"
    # mode can be "1v1", "1v1v1v1", "tournament" of "pong"

    game = data["game"]
    mode = data["mode"]

    if game == "pong":
        if mode == "1v1local":
            player = Player.objects.filter(user=request.user).first()
            data = requests.post("http://localhost:1973/createGame", data={}).json()

            return JsonResponse({"id": data["id"]})
        # if mode == "1v1" or mode == "1v1local" or mode == "1v1v1v1" or mode == "tournament":
        #     player = Player.objects.filter(user=request.user).first()
        #     entry = MatchmakingPlayer.objects.create(player=player, game=game, mode=mode)
        else:
            return JsonResponse({"error": "invalid gamemode"})
    else:
        return JsonResponse({"error": "invalid game"})

"""
Quit matchmaking
"""
@require_POST
def quitMatchmaking(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({})

    # TODO: Maybe check if the player is not already into a game ?

    player = Player.objects.filter(user=request.user).first()
    entry = MatchmakingPlayer.objects.filter(player=player).first()
    entry.delte()

    return JsonResponse({})

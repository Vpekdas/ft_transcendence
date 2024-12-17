import sys
import json
import random
import string

import django
import base64
import hashlib

from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.http.request import HttpRequest
from django.views.decorators.http import require_POST

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from app.models import duck, Player, Tournament, PongGameResult

def make_id(k=8) -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

def hash_weak_password(s) -> str:
    return hashlib.sha256("salty$" + s).hexdigest()

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
        return JsonResponse({ "error": "User is not authenticated" })

"""
Update a nickname
"""
@require_POST
def updateNickname(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    data = json.loads(request.body)

    newNickname = data["nickname"]

    player = Player.objects.filter(user=request.user).first()
    if not player:
        return JsonResponse({"error": "Internal error"})

    player.nickname = newNickname
    player.save()

    return JsonResponse({})

def invalid_user_id():
    return JsonResponse({ "error": "Invalid user identifier" })

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
        return JsonResponse({"error": "User is not authenticated"})

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

    if "nickname" not in request.GET:
        return HttpResponse(duck, content_type="image/svg+xml")

    player = Player.objects.filter(id=id).first()

    if not player or player.icon is None:
        return HttpResponse(duck, content_type="image/svg+xml")

    return HttpResponse(duck, content_type="image/svg+xml")
    # return HttpResponse(base64.b64decode(player.icon["data"]), content_type=player.icon["type"])

"""
Update profile picture
"""
@require_POST
def updateProfilePicture(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    data = json.loads(request.body)

    type = data["type"]
    image = data["image"]

    valid_types = [ "image/svg+xml", "image/png", "image/jpeg", "image/gif" ]

    if type not in valid_types:
        return JsonResponse({"error": "Invalid image format"})

    player = Player.objects.filter(user=request.user).first()
    player.icon = { "type": type, "data": image }

    player.save()

    return JsonResponse({})

@require_POST
def deleteProfile(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    user = request.user
    user.delete()

    return JsonResponse({})

@require_POST
def getMatch(request: HttpRequest, id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    # data = json.loads(request.body)
    player = Player.objects.filter(user=request.user)
    results = [r for r in PongGameResult.objects.all() if player.id in r.players]

    return JsonResponse({ "results": [json.loads(r) for r in results] })

# /api/tournament/create
@require_POST
def tournament_create(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": "User is not authenticated" })

    data = json.loads(request.body)

    if "gameSettings" not in data or "playerCount" not in data:
        return JsonResponse({ "error": "Invalid request" })

    if data["openType"] not in ["open", "password"] or data["playerCount"] not in [2, 4, 8, 16]:
        pass

    game_settings = data["gameSettings"]
    tid = make_id()

    t = Tournament(name=data["name"], tid=tid, openType=data["openType"], password=hash_weak_password(data["password"]) if "password" in data else None, game=data["game"], gameSettings=game_settings, fillWithAI=bool(data["fillWithAI"]), state="lobby")
    t.save()

    return JsonResponse({ "id": tid })

@require_POST
def tournament_info(request: HttpRequest, id: str):
    t = Tournament.objects.filter(tid=id).first()

    if t is None:
        return JsonResponse({ "error": "Tournament does not exits" })

    return JsonResponse({
        "game": t.game,
        "name": t.name,
        "openType": t.name,
        "state": t.state,
    })

@require_POST
def tournament_check_password(request: HttpRequest, id: str):
    data = json.loads(request.body)

    t = Tournament.objects.filter(tid=id).first()

    if t is None:
        return JsonResponse({ "error": "Tournament does not exits" })

    if hash_weak_password(data["password"]) == t.password:
        return JsonResponse({})
    return JsonResponse({ "error": "Password does not match" })

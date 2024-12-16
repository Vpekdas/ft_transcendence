import sys
import json
import random
import string

import django
import base64

from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.http.request import HttpRequest
from django.views.decorators.http import require_POST

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from app.models import duck, Player, PongGameResult

def make_id(k=16) -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=k))

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
    player = Player.objects.create(user=user, nickname=nickname, gid=make_id())

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
def updateNickname(request: HttpRequest):
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

"""
"""
@require_POST
def getPlayerProfile(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    data = json.loads(request.body)

    player = Player.objects.filter(user=request.user).first()

    return JsonResponse({
        "nickname": player.nickname,
        "money": player.money,
        "skins": player.skins,
        "pongElo": player.pongElo,
        "id": player.gid,
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

    return HttpResponse(duck, content_type="image/svg+xml")
    # return HttpResponse(base64.b64decode(player.icon["data"]), content_type=player.icon["type"])

"""
Update profile picture
"""
@require_POST
def updateProfilePicture(request: HttpRequest):
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
def deleteProfile(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    user = request.user
    user.delete()

    return JsonResponse({})

@require_POST
def getMatch(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"})

    # data = json.loads(request.body)
    player = Player.objects.filter(user=request.user)
    results = [r for r in PongGameResult.objects.all() if player.gid in r.players]

    return JsonResponse({ "results": [json.loads(r) for r in results] })

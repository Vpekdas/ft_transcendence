import sys
import json

import django

from django.http import JsonResponse, HttpResponseBadRequest
from django.http.request import HttpRequest

from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from app.models import Player

"""
Create a new user.
"""
def signin(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseBadRequest()

    data = json.loads(request.body)

    if not "username" in data or not "password" in data or not "nickname" in data:
        return HttpResponseBadRequest()

    username = data["username"]
    password = data["password"]
    nickname = data["nickname"]

    if User.objects.filter(username=username).count() > 0:
        return JsonResponse({"error": "Username is already taken"})

    user = User.objects.create(username=username, password=password)
    player = Player.objects.create(user=user, nickname=nickname)

    # user = authenticate(request=request, username=username, password=password)

    # if user is None:
    #     return JsonResponse({"error": "Internal error"})

    return JsonResponse({})

"""
Log-in
"""
def login(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseBadRequest()

    data = json.loads(request.body)

    if not "username" in data or not "password" in data:
        return HttpResponseBadRequest()

    username = data["username"]
    password = data["password"]

    if request.user.is_authenticated:
        return JsonResponse({})

    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({ "error": "Mismatch username and password" })
    else:
        return JsonResponse({})

"""
Check if the user is logged in,
"""
def isLoggedIn(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseBadRequest()

    if request.user.is_authenticated:
        return JsonResponse({})
    else:
        return JsonResponse({ "error": "" })

"""
Returns all existing users.
"""
def allUsers(request: HttpRequest):
    #if request.method != "POST":
    #    return HttpResponseBadRequest()

    players = Player.objects.all()
    usernames = []

    for player in players:
        usernames.append(player.nickname)

    return JsonResponse({ "users": usernames })

"""
"""
def playerProfile(request: HttpRequest):
    pass

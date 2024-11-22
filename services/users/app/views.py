import sys
import json

import django

from django.http import JsonResponse, HttpResponseBadRequest
from django.http.request import HttpRequest

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
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

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, nickname=nickname)

    user.set_password(password)
    user.save()

    login(request, user)

    return JsonResponse({})

"""
Log-in
"""
def loginRoute(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseBadRequest()

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

def logoutRoute(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseBadRequest()

    logout(request)

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
        return JsonResponse({ "error": "User is not logged in" })

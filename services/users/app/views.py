import sys
import json

import django

from django.http import JsonResponse, HttpResponseBadRequest
from django.http.request import HttpRequest
from django.views.decorators.http import require_POST

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from app.models import Player

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

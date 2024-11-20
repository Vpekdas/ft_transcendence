from django.http import JsonResponse, HttpResponseBadRequest
from django.http.request import HttpRequest

from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from app.models import Player
# from app.models import AuthToken

# import jwt

# JWT_SECRET = "yh55ei3oouedi64nh89regwhegfio3U90J34fi203fj238th"

# def createAuthToken(user: User) -> AuthToken:
#     payload = {
#         "name": user.username,
#     }

#     token = jwt.encode(payload=payload, key=JWT_SECRET)
#     return AuthToken(user=user, data=token)

"""
Create a new user.
"""
def signin(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseBadRequest()

    username = request.POST.get('username')
    password = request.POST.get('password')
    nickname = request.POST.get('nickname')

    if username == None or password == None or nickname == None:
        return HttpResponseBadRequest()

    user = User(username=username, password=password)

    if User.objects.count(username=username) > 0:
        return JsonResponse({"error": "Username is already taken"})

    user.save()
    player = Player(user=user, nickname=nickname)
    player.save()

    user = authenticate(username=username, password=password)

    if not user.is_authenticated:
        return JsonResponse({"error": "Internal error"})

    return JsonResponse({})

"""
Log-in
"""
def login(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseBadRequest()

    username = request.POST.get('username')
    password = request.POST.get('password')

    if username == None or password == None:
        return HttpResponseBadRequest()

    if request.user.is_authenticated:
        return JsonResponse({})

    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({ "error": "Mismatch username and password" })
    else:
        return JsonResponse({})

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

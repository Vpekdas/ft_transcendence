"""
URL configuration for users project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from app import views
from .ws import PongClientConsumer, TournamentConsumer, PongMatchmakeConsumer, ChatConsumer

urlpatterns = [
    path('admin/', admin.site.urls),

    # Account management
    path('api/signin', views.signin),
    path('api/signin-external', views.signinExternal),
    path('api/login', views.loginRoute),
    path('api/logout', views.logoutRoute),
    path('api/check-logged', views.isLoggedIn), # was api/isLoggedIn

    path('api/player/<str:id>/password/update', views.updatePassword), # was api/updatePassword
    path('api/player/<str:id>/nickname', views.getNickname),
    path('api/player/<str:id>/nickname/update', views.updateNickname), # was api/updateNickname
    path('api/player/<str:id>/profile', views.getPlayerProfile), # was api/getPlayerProfile
    path('api/player/<str:id>/picture', views.getProfilePicture), # was api/getProfilePicture
    path('api/player/<str:id>/picture/update', views.updateProfilePicture), # was api/updateProfilePicture
    path('api/player/<str:id>/delete', views.deleteProfile), # was api/deleteProfile
    path('api/player/<str:id>/matches', views.getMatches),
    path('api/player/<str:id>/stats/pong', views.getPongStats),

    # path('api/player/<str:id>/skins/buy/<str:name>', ...),
    path('api/player/<str:id>/skins/select-terrain/<str:name>', views.selectTerrainSkin),
    path('api/player/<str:id>/skins/select-ball/<str:name>', views.selectBallSkin),

    path('api/tournament/create', views.tournament_create),
]

websocket_urlpatterns = [
    path('ws/pong/<str:id>', PongClientConsumer.as_asgi()),
    path('ws/matchmake/pong', PongMatchmakeConsumer.as_asgi()),
    path('ws/tournament/<str:id>', TournamentConsumer.as_asgi()),
    path('ws/chat', ChatConsumer.as_asgi())
]

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
from .ws import ClientConsumer

urlpatterns = [
    path('admin/', admin.site.urls),

    # Account management
    path('api/signin', views.signin),
    path('api/login', views.loginRoute),
    path('api/logout', views.logoutRoute),
    path('api/isLoggedIn', views.isLoggedIn),
    path('api/updatePassword', views.updatePassword),
    path('api/updateNickname', views.updateNickname),
    path('api/getPlayerProfile', views.getPlayerProfile),
    path('api/getProfilePicture', views.getProfilePicture),
    path('api/updateProfilePicture', views.updateProfilePicture),
    path('api/deleteProfile', views.deleteProfile)
]

websocket_urlpatterns = [
    path('ws', ClientConsumer.as_asgi())
]


from django.db import models
from django.db.models import ForeignKey, CharField, JSONField, TextField, IntegerField, BooleanField, ImageField, DateTimeField, ManyToManyField
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.utils.timezone import now, timedelta
import base64

duck = '<svg height="64" preserveAspectRatio="none" viewBox="0 0 64 64" width="64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><radialGradient id="a" cx="33.324192" cy="22.625" gradientUnits="userSpaceOnUse" r="42.05378"><stop offset=".5265487" stop-color="#fff"/><stop offset="1" stop-color="#d9b98b"/></radialGradient><radialGradient id="b" cx="15.477564" cy="30.663462" gradientTransform="matrix(.8658794 .5002529 -1.1417177 1.97618 37.084877 -37.675751)" gradientUnits="userSpaceOnUse" r="14.089451"><stop offset=".4508043" stop-color="#f8eb00"/><stop offset="1" stop-color="#f5b32c"/></radialGradient><linearGradient id="c" gradientUnits="userSpaceOnUse" x1="40.512749" x2="40.512749" y1="16.664583" y2="19.081249"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient><path d="m34.9492188 63c-11.7133789 0-12.0136719-5.6152344-12.2543945-10.1259766-.1166992-2.1767578-.2172852-4.0625-1.4262695-5.2587891-1.3496094.1279297-2.7939453.1923828-4.3007813.1923828-7 0-15.7114258 0-15.7114258-5.5576172 0-3.9228516 2.4716797-5.7158203 4.8618164-7.4501953 1.8388672-1.3349609 3.7402344-2.7143555 5.0649414-5.1772461 1.4414063-2.6782227 2.2963867-4.2680664 3.2836914-5.2304688 1.9399414-16.0761717 7.8930664-22.6420897 20.4824219-22.6420897 17.3339844 0 20.5878906 9.4838867 23.2021484 17.1040039.2089844.6083984.4140625 1.206543.6230469 1.7895508 4.9628906 13.8369141 4.9628906 16.9277344 4.9628906 21.6064453 0 9.8144531-11.8232422 20.75-28.7880859 20.75zm-12.9516602-17.4726562.5537109.546875c1.8759766 1.7431641 2.0102539 4.2597656 2.140625 6.6923828.2358399 4.4179687.4399414 8.2333984 10.2573243 8.2333984 15.3320313 0 26.7880859-9.8994141 26.7880859-18.75 0-4.4697266 0-7.421875-4.8457031-20.9316406-.2119141-.5913086-.4199219-1.1982422-.6318359-1.8149414-2.5332032-7.3842774-5.4042969-15.753418-21.3105469-15.753418-11.5717773 0-16.7700195 5.9575195-18.5405273 21.2490234l-.0463867.402832-.3139648.2563477c-.8227539.671875-1.6811523 2.2680664-3.1035156 4.9116211-1.5419922 2.8657227-3.7255859 4.4506836-5.6523438 5.8481445-2.3432618 1.7011719-4.0361329 2.9296876-4.0361329 5.8320313 0 3.5576172 7.9248047 3.5576172 13.7114258 3.5576172 1.6147461 0 3.1503906-.0771484 4.5639648-.2294922z" fill="#3e3a39"/><path d="m34.948719 2.75c17.9807663 0 20.1009636 10.4692993 22.884613 18.2307701 4.9038468 13.6730766 4.9038468 16.7115364 4.9038468 21.2692299 0 9.1153831-11.4423065 19.75-27.7884598 19.75s-8.4535332-10.8952751-13.0769234-15.1923065c-4.9038467-4.5576935-7.4143609-13.1285248-6.5384626-21.2692318 1.6346159-15.1923075 6.5384627-22.7884617 19.615386-22.7884617z" fill="url(#a)"/><path d="m20.2371788 24.0192299c6.5384617 0 6.5384617 0 9.8076935 6.0769234s4.9038467 3.0384636 4.9038467 6.0769234c0 1.5192299 0 10.6346169-17.9807701 10.6346169-6.5384617 0-14.7115383 0-14.7115383-4.5576935 0-6.0769234 6.5384607-6.0769234 9.8076916-12.1538467s3.2692308-6.0769235 8.1730766-6.0769235z" fill="url(#b)"/><ellipse cx="24.578838" cy="30.757862" fill="#804f21" rx=".521862" ry="1.625" transform="matrix(.7322221 .6810659 -.6810659 .7322221 27.529799 -8.503533)"/><ellipse cx="41.375" cy="19.5" fill="#231815" rx="3.125" ry="3.75"/><ellipse cx="40.512749" cy="17.872917" fill="url(#c)" rx="1.217624" ry="1.208333"/></svg>'

def default_skins():
    return {"terrain": "colorful-terrain", "ball": "colorful-ball", "bar": "colorful-bar"}

class Player(models.Model):
    user = ForeignKey(User, on_delete=models.CASCADE)
    nickname = CharField(max_length=20)
    two_factor = BooleanField(default=False)

    external = BooleanField(default=False)
    accessToken = TextField(null=True)

    icon = JSONField(null=True)

    money = IntegerField(default=0)
    skins = JSONField(default=default_skins)

    pongElo = IntegerField(default=0)

    friends = models.ManyToManyField("self", symmetrical=True)
    blockedUsers = models.ManyToManyField("self", symmetrical=False)

    channelList = ArrayField(models.CharField(max_length=255), default=list)
    discussingWith = ArrayField(models.IntegerField(), default=list)
    is_online = models.BooleanField(default=False)



class Tournament(models.Model):
    name = TextField()
    playerCount = IntegerField()
    openType = TextField()
    password = TextField(null=True)
    game = TextField()
    fillWithAI = BooleanField()

    gameSettings = JSONField()

    tid = CharField(max_length=8)
    players = ArrayField(IntegerField(), default=list)
    steps = JSONField(default=dict)
    state = TextField() # lobby, ended

class PongGameResult(models.Model):
    gamemode = TextField()

    player1 = IntegerField()
    player2 = IntegerField()

    score1 = IntegerField()
    score2 = IntegerField()

    timeStarted = IntegerField()
    timeEnded = IntegerField()

    tid = CharField(max_length=8, null=True)
    stats = JSONField(default=dict)

class Message(models.Model):
    content = TextField()
    timestamp = DateTimeField(auto_now_add=True)
    sender = ForeignKey(Player, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = ForeignKey(Player, on_delete=models.CASCADE, related_name="received_messages")

class Chat(models.Model):
    messages = models.ManyToManyField(Message, related_name="chats")
    channel_name = CharField(max_length=255, null=True, blank=True)

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        """ Vérifie si l'OTP est valide (expire après 5 minutes) """
        return now() < self.created_at + timedelta(minutes=5)

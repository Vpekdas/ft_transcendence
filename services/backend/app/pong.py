import sys
import os
import json
import math
from datetime import datetime

from .gameframework import log, sync, Game, ServerManager, Vec3, Box, Sphere, Body, Scene, Client, BodyType, Area, CollisionResult, State
from .models import PongGameResult, PongOngoingGame

def time_secs():
    return (datetime.now() - datetime(1970, 1, 1)).total_seconds()

class Player(Body):
    speed = 0.2

    def __init__(self, name: str):
        super().__init__(type="Player", shape=Box(Vec3(-0.5, -2.5, 0), Vec3(0.5, 2.5, 0)), client=None)
        self.id = name
        self.score = 0

    def process(self):
        if self.client.is_pressed("up"):
            self.move_up()
        if self.client.is_pressed("down"):
            self.move_down()

        self.try_move()
        self.velocity = Vec3()

    def move_up(self):
        self.velocity.y += self.speed

    def move_down(self):
        self.velocity.y -= self.speed

    def on_collision(self, dir: Vec3, collision: CollisionResult):
        collision.collider.velocity = self._bounce_vec(-collision.normal, dir, collision.collider.bounce) * Ball.speed

class Ball(Body):
    speed = 0.3

    def __init__(self):
        super().__init__(type="Ball", shape=Sphere(0.5, Vec3()), body_type=BodyType.DYNAMIC)
        self.last_collision = None
        self.velocity = Vec3(1, -1, 0).normalized() * Ball.speed
        self.bounce = 1.0

    def process(self):
        self.try_move()

    def on_collision(self, dir: Vec3, collision: CollisionResult):
        self.velocity = self._bounce_vec(collision.normal, dir, self.bounce) * self.speed

class ScoreArea(Area):
    def __init__(self, *, player=None, pos=Vec3(), game=None):
        super().__init__(pos=pos, shape=Box(min=Vec3(-1, -12.2, 0.5), max=Vec3(1, 12.2, 0.5)))
        self.player = player
        self.game = game

    def body_entered(self, body):
        self.player.score += 1
        self.game.reset()

class Settings:
    def __init__(self, *, max_score=9, players_expected: list[str]=None):
        self.max_score = max_score
        self.players_expected = players_expected

class Pong(Game):
    def __init__(self, *, gamemode: str = None):
        super().__init__()

        self.settings = Settings()
        self.service = 0
        self.players_count = 2
        self.gamemode = gamemode
        self.master = None

        self.player1 = Player("player1")
        self.player1.pos = Vec3(-17, 0, 0)
        self.player2 = Player("player2")
        self.player2.pos = Vec3(17, 0, 0)

        self.ball = Ball()
        self.ball.pos = Vec3(0, 0, 0)

        self.score1 = ScoreArea(player=self.player2, pos=Vec3(-19, 0, 0), game=self)
        self.score2 = ScoreArea(player=self.player1, pos=Vec3(19, 0, 0), game=self)

        self.scene.add_body(self.score1)
        self.scene.add_body(self.score2)

        self.scene.add_body(self.player1)
        self.scene.add_body(self.player2)
        self.scene.add_body(self.ball)

        border_box = Box(Vec3(-18, -0.2, 0), Vec3(18, 0.2, 0))

        self.scene.add_body(Body(type="Wall", shape=border_box, pos=Vec3(0, -12, 0)))
        self.scene.add_body(Body(type="Wall", shape=border_box, pos=Vec3(0, 12, 0)))

    def reset(self):
        self.player1.pos.y = 0
        self.player2.pos.y = 0
        self.ball.pos = Vec3(0, 0, 0)

        if self.service == 1:
            self.ball.velocity = Vec3(1, -1, 0).normalized() * Ball.speed
        else:
            self.ball.velocity = Vec3(-1, -1, 0).normalized() * Ball.speed

        if self.service == 1: self.service = 0
        else: self.service = 1

        if self.score1 == self.settings.max_score and self.state == State.STARTED:
            self.state = State.ENDED

            # Save the result of the game in the database
            result = PongGameResult(scores=[self.score1.score, self.score2.score], timeStarted=self.timeStarted, timeEnded=time_secs())
            sync(lambda: result.save())

            # Remove the ongoing game from the database
            ongoingGame = sync(lambda: PongOngoingGame.objects.filter(gid=self.id).first())
            sync(lambda: ongoingGame.delete())
        else:
            # Update the score
            ongoingGame = sync(lambda: PongOngoingGame.objects.filter(gid=self.id).first())
            ongoingGame.scores = [self.player1.score, self.player1.score]
            sync(lambda: ongoingGame.save())

    async def on_update(self):
        if self.state == State.STARTED:
            self.scene.update()
            await self.broadcast({ "type": "update", "bodies": self.scene.to_dict(), "scores": [ self.player1.score, self.player2.score ] })

    async def on_join(self, gamemode: str, player_id: str):
        if gamemode == "1v1local":
            self.state = State.STARTED
            self.clients.append(Client(id=player_id, subid="player1"))
            self.clients.append(Client(id=player_id, subid="player2"))

            self.player1.client = self.clients[0]
            self.player2.client = self.clients[1]

            self.timeStarted = time_secs()
            ongoingGame = PongOngoingGame(gid=self.id, gamemode=self.gamemode, timeStarted=self.timeStarted, players=[player_id], scores=[0, 0])
            sync(lambda: ongoingGame.save())
        elif gamemode == "1v1":
            client = Client(id=player_id)
            self.clients.append(client)

            if self.player1.client is None:
                self.player1.client = client
            elif self.player2.client is None:
                self.player2.client = client

            if len(self.clients) == 2:
                self.state = State.STARTED

                # Add an ongoing game to the database
                self.timeStarted = time_secs()
                ongoingGame = PongOngoingGame(gid=self.id, gamemode=self.gamemode, timeStarted=self.timeStarted, players=[self.player1.id, self.player2.id], scores=[0, 0])
                sync(lambda: ongoingGame.save())

            # if self.settings.players_expected == None or ("player_id" in msg and msg["player_id"] in self.settings.players_expected):
            #     pass

    async def on_unhandled_message(self, msg):
        pass

class MatchmakePlayer:
    def __init__(self, *, conn, player_id: str, gamemode: str):
        self.conn = conn
        self.player_id = player_id
        self.gamemode = gamemode

class PongServer(ServerManager):
    def __init__(self):
        super().__init__()

        self.players = []

    async def do_matchmaking(self, conn, msg):
        if self.already_in_game(conn):
            self.err_already_in_game(conn)
            return

        if msg["gamemode"] == "1v1local":
            game = Pong(gamemode=msg["gamemode"])

            self.start_game(game)

            # Instantly send a match found to the player since he is playing against himself
            await conn.send(json.dumps({ "type": "matchFound", "id": game.id }))
            await game.on_join(msg["gamemode"], msg["playerId"])
        elif msg["gamemode"] == "1v1":
            try:
                opponent = next(filter(lambda p: p.gamemode == msg["gamemode"], self.players))

                game = Pong(gamemode=msg["gamemode"])
                self.start_game(game)

                await game.on_join(msg["gamemode"], opponent.player_id)
                await game.on_join(msg["gamemode"], msg["playerId"])

                await conn.send(json.dumps({ "type": "matchFound", "id": game.id, "gamemode": msg["gamemode"] }))
                await opponent.conn.send(json.dumps({ "type": "matchFound", "id": game.id }))

                self.players.remove(opponent)
            except StopIteration:
                self.players.append(MatchmakePlayer(conn=conn, player_id=msg["playerId"], gamemode=msg["gamemode"]))

    async def on_join(self, conn) -> bool:
        game = self.get_game(conn.player.gid)

        if game is not None:
            await conn.send(json.dumps({ "type": "matchFound", "id": game.id, "gamemode": game.gamemode }))

        return False

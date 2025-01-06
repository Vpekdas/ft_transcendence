import sys
import os
import json
import math

from .gameframework import log, time_secs, sync, Game, ServerManager, Vec3, Box, Sphere, Body, Scene, Client, BodyType, Area, CollisionResult, State, ClientAI
from .models import PongGameResult

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

    #def on_collision(self, dir: Vec3, collision: CollisionResult):
    #    collision.collider.velocity = self._bounce_vec(-collision.normal, dir, collision.collider.bounce) * Ball.speed

class Ball(Body):
    speed = 0.3

    def __init__(self):
        super().__init__(type="Ball", shape=Sphere(0.5, Vec3()), body_type=BodyType.DYNAMIC, bounce=1.0)
        self.last_collision = None
        self.velocity = Vec3(1, -1, 0).normalized() * Ball.speed

    def process(self):
        self.try_move()

    def on_collision(self, dir: Vec3, collision: CollisionResult):
        if isinstance(collision.collider, Player):
            player: Player = collision.collider

            y_diff = self.pos.y - player.pos.y
            n_x = Vec3()

            if self.pos.x > 0:
                n_x = -1
            else:
                n_x = 1

            normal = Vec3(n_x, 0, 0)

            if y_diff < 0:
                dir = Vec3(n_x, -1, 0)
            elif y_diff > 0:
                dir = Vec3(n_x, 1, 0)

            factor = abs(y_diff) / 2.5 * 0.5
            self.velocity = (dir + normal * (1.0 - factor)).normalized() * self.speed
        else:
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
    def __init__(self, *, max_score=3):
        self.max_score = max_score

class Pong(Game):
    def __init__(self, *, gamemode: str, tid: str = None, acceptedPlayers: list[int] = None):
        super().__init__(tid=tid, gamemode=gamemode)

        self.settings = Settings()
        self.service = 0
        self.players_count = 2
        self.master = None
        self.acceptedPlayers = acceptedPlayers

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

        self.already_send_redirect = False

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

        if (self.player1.score == self.settings.max_score or self.player2.score == self.settings.max_score) and self.state == State.STARTED:
            self.state = State.ENDED

            # Save the result of the game in the database
            # result = PongGameResult(scores=[self.score1.score, self.score2.score], timeStarted=self.timeStarted, timeEnded=time_secs(), tid=self.tid)
            # sync(lambda: result.save())

    async def on_update(self):
        if self.state == State.STARTED:
            self.scene.update()

            # Update all AIs
            for client in self.clients:
                if isinstance(client, ClientAI):
                    client.process(self.scene)

            await self.broadcast({ "type": "update", "bodies": self.scene.to_dict(), "scores": [ self.player1.score, self.player2.score ] })
        elif self.state == State.ENDED:
            await self.broadcast({ "type": "update", "bodies": self.scene.to_dict(), "scores": [ self.player1.score, self.player2.score ] })

            winner = self.player1.client.id if self.player1.score > self.player2.score else self.player2.score
            await self.broadcast({ "type": "gameEnded", "winner": winner })

            if self.is_tournament_game() and not self.already_send_redirect:
                # Tournaments need to collect the result of the game, so its up to it to set the state to DEAD

                await self.broadcast({ "type": "redirectTournament", "id": self.tid })
                self.already_send_redirect = True
            elif not self.is_tournament_game():
                self.state = State.DEAD

    async def on_join(self, player_id: int):
        if self.acceptedPlayers is not None and player_id not in self.acceptedPlayers:
            return False

        if self.gamemode == "1v1local":
            self.state = State.STARTED
            self.clients.append(Client(id=player_id, subid="player1"))
            self.clients.append(Client(id=player_id, subid="player2"))

            self.player1.client = self.clients[0]
            self.player2.client = self.clients[1]

            self.timeStarted = time_secs()
        elif self.gamemode == "1v1":
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

        return True

    async def on_unhandled_message(self, msg):
        pass

    def get_score(self, index: int) -> int:
        if index == 0:
            return self.player1.score
        else:
            return self.player2.score

class MatchmakePlayer:
    def __init__(self, *, conn, player_id: str, gamemode: str):
        self.conn = conn
        self.player_id = player_id
        self.gamemode = gamemode

class PongManager(ServerManager):
    def __init__(self):
        super().__init__(ty=Pong)

        self.players = []

    async def do_matchmaking(self, conn, gamemode: str, player: Player):
        try:
            p = next(filter(lambda p: p.player_id == player.id, self.players))
            return
        except:
            pass

        if gamemode == "1v1local":
            game = self.start_game(gamemode=gamemode)

            # Instantly send a match found to the player since he is playing against himself
            await conn.send(json.dumps({ "type": "matchFound", "id": game.id, "gamemode": gamemode }))
            await game.on_join(player.id)
        elif gamemode == "1v1":
            try:
                opponent = next(filter(lambda p: p.gamemode == gamemode, self.players))

                game = self.start_game(gamemode=gamemode)

                await game.on_join(opponent.player_id)
                await game.on_join(player.id)

                await conn.send(json.dumps({ "type": "matchFound", "id": game.id, "gamemode": gamemode }))
                await opponent.conn.send(json.dumps({ "type": "matchFound", "id": game.id }))

                self.players.remove(opponent)
            except StopIteration:
                self.players.append(MatchmakePlayer(conn=conn, player_id=player.id, gamemode=gamemode))

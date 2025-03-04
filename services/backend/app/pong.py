import sys
import os
import json
import math
import asyncio
import time

from threading import Thread

from .gameframework import log, time_secs, sync, Game, GameManager, Vec3, Box, Sphere, Body, Scene, Client, BodyType, Area, CollisionResult, State, Timer
from .models import PongGameResult, Player as PlayerModel
from channels.db import database_sync_to_async

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

class Ball(Body):
    speed = 0.3

    def __init__(self):
        super().__init__(type="Ball", shape=Sphere(0.5, Vec3()), body_type=BodyType.DYNAMIC, bounce=1.0)
        self.last_collision = None

    def process(self):
        self.try_move()

        self.scene.backlog.append(json.dumps({ "type": "bounce", "body": self.to_dict() }))

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

            player: Player = collision.collider
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
    def __init__(self, *, max_score=7):
        self.max_score = max_score

class Pong(Game):
    def __init__(self, *, gamemode: str, tid: str = None, accepted_players: list[int] = None):
        super().__init__(tid=tid, gamemode=gamemode)

        # size is 36x24

        self.settings = Settings()
        self.service = 0
        self.players_count = 2
        self.master = None
        self.accepted_players = accepted_players

        self.player1 = Player("player1")
        self.player1.pos = Vec3(-17, 0, 0)
        self.player2 = Player("player2")
        self.player2.pos = Vec3(17, 0, 0)

        self.ball = Ball()
        self.ball.pos = Vec3(0, 0, 0)
        self.ball.velocity = Vec3(1, -1, 0).normalized() * Ball.speed

        self.score1 = ScoreArea(player=self.player2, pos=Vec3(-19, 0, 0), game=self)
        self.score2 = ScoreArea(player=self.player1, pos=Vec3(19, 0, 0), game=self)

        self.scene.add_body(self.score1)
        self.scene.add_body(self.score2)

        self.scene.add_body(self.player1)
        self.scene.add_body(self.player2)
        self.scene.add_body(self.ball)

        border_box = Box(Vec3(-18, -0.2, 0), Vec3(18, 0.2, 0))

        self.scene.add_body(Body(type="Wall", shape=border_box, pos=Vec3(0, -12.4, 0)))
        self.scene.add_body(Body(type="Wall", shape=border_box, pos=Vec3(0, 12.4, 0)))

        self.already_send_redirect = False
        self.already_saved = False
        self.countdown_timer = Timer(time=3.0)

        ## Global stats

        # stores the position of the ball every X seconds
        self.heatmap = []

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

            self.time_ended = time_secs()

    async def on_update(self):
        if self.state == State.STARTED:
            if self.countdown_timer.is_done():
                self.scene.update()

                if self.frames % 15 == 0:
                    self.heatmap.append({ "x": self.ball.pos.x, "y": self.ball.pos.y })
            else:
                self.countdown_timer.update()
        elif self.state == State.ENDED:
            winner = self.player1.client.id if self.player1.score > self.player2.score else self.player2.score
            await self.broadcast({ "type": "gameEnded", "winner": winner, "score1": self.player1.score, "score2": self.player2.score })

            if self.is_tournament_game() and not self.already_send_redirect:
                # Tournaments need to collect the result of the game, so its up to it to set the state to DEAD

                await self.broadcast({ "type": "redirectTournament", "id": self.tid })
                self.already_send_redirect = True
            elif not self.is_tournament_game():
                self.state = State.DEAD

            if not self.already_saved:
                # Save the result of the game in the database
                await self.save_results()
        elif self.state == State.IN_LOBBY:
            if len(self.clients) == 2 or self.gamemode == "1v1local":
                self.state = State.STARTED

        await self.broadcast({ "type": "update", "bodies": self.scene.to_dict(), "scores": [ self.player1.score, self.player2.score ], "gamemode": self.gamemode })

        for event in self.scene.backlog:
            await self.broadcast_raw(event)
        self.scene.backlog = []

    @database_sync_to_async
    def save_results(self):
        PongGameResult.objects.create(
            score1=self.player1.score,
            score2=self.player2.score,
            player1=self.clients[0].id,
            player2=self.clients[1].id,
            tid=self.tid,
            timeStarted=self.time_started,
            timeEnded=self.time_ended,
            gamemode=self.gamemode,
            stats={ "heatmap": self.heatmap, "p1": { "up_count": self.clients[0].up_count, "down_count": self.clients[0].down_count }, "p2": { "up_count": self.clients[1].up_count, "down_count": self.clients[1].down_count } }
        )

        if self.gamemode == "1v1" and not self.is_tournament_game():
            p1 = PlayerModel.objects.filter(id=self.clients[0].id).first()
            p2 = PlayerModel.objects.filter(id=self.clients[1].id).first()

            winner = p1 if self.player1.score > self.player2.score else p2
            looser = p2 if self.player1.score > self.player2.score else p1

            base = 50
            gain: int = 1

            if winner.pongElo == 0 and looser.pongElo == 0:
                gain = base / 2
            elif looser.pongElo == 0:
                gain = (1 / winner.pongElo / 2) * base
            else:
                gain = looser.pongElo / winner.pongElo / 2 * base

            winner.pongElo += gain
            looser.pongElo -= gain

            if looser.pongElo < 0: looser.pongElo = 0

            winner.save()
            looser.save()

    async def on_join(self, player_id: int):
        if self.accepted_players is not None and player_id not in self.accepted_players:
            return False

        if self.gamemode == "1v1local":
            self.clients.append(Client(id=player_id, subid="player1"))
            self.clients.append(Client(id=player_id, subid="player2"))

            self.player1.client = self.clients[0]
            self.player2.client = self.clients[1]

            self.time_started = time_secs()
        else:
            client = Client(id=player_id)
            self.clients.append(client)

            if self.player1.client is None:
                self.player1.client = client
            elif self.player2.client is None:
                self.player2.client = client

            if len(self.clients) == 2:
                # Add an ongoing game to the database
                self.time_started = time_secs()

        return True

    async def on_unhandled_message(self, msg):
        pass

    def get_score(self, index: int) -> int:
        if index == 0:
            return self.player1.score
        else:
            return self.player2.score

class MatchmakePlayer:
    def __init__(self, *, conn, player_id: str, gamemode: str, elo: int):
        self.conn = conn
        self.player_id = player_id
        self.gamemode = gamemode
        self.elo = elo

    def __lt__(self, other):
        return self.elo < other.elo

class PongManager(GameManager):
    def __init__(self):
        super().__init__(ty=Pong)

        self.players: list[Player] = []

        self.loop_running = False

    def start_watcher(self):
        self.loop_running = True

        self.thread = Thread(target=self.thread_runner)
        self.thread.start()

    def has_watcher_started(self) -> bool:
        return self.loop_running

    def thread_runner(self):
        self.event_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.event_loop)
        self.event_loop.create_task(self.matchmake_loop())
        self.event_loop.run_forever()

    async def matchmake_loop(self):
        while self.loop_running:
            if len(self.players) >= 2:
                players = sorted(self.players, reverse=True)

                p1 = players[0]
                p2 = players[1]

                self.players.remove(p1)
                self.players.remove(p2)

                game = self.start_game(gamemode="1v1")
                game.accepted_players = [p1.player_id, p2.player_id]

                # await game.on_join(p1.player_id)
                # await game.on_join(p2.player_id)

                await p1.conn.send(json.dumps({ "type": "matchFound", "id": game.id, "gamemode": "1v1", "opponent": p2.player_id }))
                await p2.conn.send(json.dumps({ "type": "matchFound", "id": game.id, "gamemode": "1v1", "opponent": p1.player_id }))

            await asyncio.sleep(1.0)

    async def do_matchmaking(self, conn, gamemode: str, player: Player, opponent: int=None):
        try:
            p = next(filter(lambda p: p.player_id == player.id, self.players))
            return
        except StopIteration:
            pass

        if gamemode == "1v1local":
            game = self.start_game(gamemode=gamemode)

            # Instantly send a match found to the player since he is playing against himself
            await conn.send(json.dumps({ "type": "matchFound", "id": game.id, "gamemode": gamemode }))
            await game.on_join(player.id)
        elif gamemode == "1v1":
            self.players.append(MatchmakePlayer(conn=conn, player_id=player.id, gamemode=gamemode, elo=player.pongElo))

    async def on_quit(self, player: Player):
        try:
            mplayer = next(filter(lambda p: player.id == p.player_id, self.players))
            self.players.remove(mplayer)

            print(player.id, " has quit")
        except StopIteration:
            pass

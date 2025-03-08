import { getOriginNoProtocol, showToast, api, getNickname, post } from "../utils";
import { Component, navigateTo } from "../micro";
import { tr } from "../i18n";

export default class PongMatchmake extends Component {
    timeInMinutes(time) {
        const minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);

        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return minutes + ":" + seconds;
    }

    clean() {
        clearInterval(this.chronometer.timerId);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        }
    }

    async init() {
        const GET = location.search
            .substring(1)
            .split("&")
            .map((value) => value.split("="))
            .reduce((obj, item) => ((obj[item[0]] = item[1]), obj), {});

        if (GET["gamemode"] == undefined) {
            navigateTo("/");
        }

        this.chronometer = { timerId: 0, seconds: 0 };

        this.onready = () => {
            const timer = document.querySelector(".timer");

            setInterval(() => {
                this.chronometer.seconds++;
                const formattedTime = this.timeInMinutes(this.chronometer.seconds);
                timer.innerHTML = formattedTime;
            }, 1000);
        };

        this.ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/matchmake/pong`);
        this.ws.onopen = (event) => {
            this.ws.send(
                JSON.stringify({
                    type: "request",
                    gamemode: GET["gamemode"],
                    opponent: GET["opponent"],
                })
            );
        };
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data["type"] == "matchFound") {
                // Do not wait if we are playing against ourself.
                if (GET["gamemode"].endsWith("local")) {
                    navigateTo("/play/pong/" + data["id"]);
                } else {
                    this.opponentNickname = await getNickname(data.opponent);
                    this.opponentProfilePicture = api("/api/player/" + data.opponent + "/picture");

                    this.info = await post("/api/player/c/profile").then((res) => res.json());
                    this.nickname = this.info.nickname;
                    this.profilePicture = api("/api/player/" + this.info.id + "/picture");

                    this.elo = await post("/api/player/" + this.info.id + "/profile").then((res) => res.json());
                    this.opponentElo = await post("/api/player/" + data.opponent + "/profile").then((res) =>
                        res.json()
                    );

                    // Display 2 players cards with their info.
                    const vsContainer = document.querySelector(".container-fluid.vs-container");
                    vsContainer.innerHTML =
                        /* HTML */
                        `<div class="card settings other-profile matchmake">
                                <h5 class="card-title settings" data-text="Name">${this.nickname}</h5>
                                <img src="${this.profilePicture}" class="card-img-top profile" id="profile-picture" />
                                <div class="card-body settings other-profile">
                                    <div class="elo-container">
                                        <i class="bi bi-trophy"></i> ${tr("Elo: ")} ${this.elo.pongElo}
                                    </div>
                                </div>
                            </div>
                            <div class="glitch-wrapper vs">
                                <div class="glitch vs" data-glitch="VS">VS</div>
                            </div>
                            <div class="card settings other-profile matchmake">
                                <h5 class="card-title settings" data-text="Name">${this.opponentNickname}</h5>
                                <img
                                    src="${this.opponentProfilePicture}"
                                    class="card-img-top profile"
                                    id="profile-picture"
                                />
                                <div class="card-body settings other-profile">
                                    <div class="elo-container">
                                        <i class="bi bi-trophy"></i> ${tr("Elo: ")} ${this.opponentElo.pongElo}
                                    </div>
                                </div>
                            </div>`;
                    setTimeout(() => navigateTo("/play/pong/" + data["id"]), 5000);
                }
            }
        };
    }

    async clean() {
        if (this.ws) {
            this.ws.close();
        }
    }

    render() {
        return /* HTML */ `<HomeNavBar />
            <div class="container-fluid matchmaking-container">
                <div class="searching-matchmake">
                    <div class="spinner-border text-warning" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span>${tr("Searching for a match...")}</span>
                </div>
                <div class="timer">0:00</div>
                <div class="container-fluid vs-container"></div>
            </div>`;
    }
}

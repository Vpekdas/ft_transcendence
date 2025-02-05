import { getOriginNoProtocol, showToast } from "../utils";
import { Component, navigateTo } from "../micro";
import { tr } from "../i18n";

export default class PongMatchmake extends Component {
    timeInMinutes() {
        const [time, setTime] = this.usePersistent("matchmakeTimer", 0);

        const minutes = Math.floor(time() / 60);
        let seconds = Math.floor(time() % 60);

        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return minutes + ":" + seconds;
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

        const [time, setTime] = this.usePersistent("matchmakeTimer", 0); // TODO: No need to store the value in localStorage here.

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
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log(data);

            if (data["type"] == "matchFound") {
                // Do not wait if we are playing against ourself.
                if (GET["gamemode"].endsWith("local")) {
                    navigateTo("/play/pong/" + data["id"]);
                } else {
                    document.querySelector(".match-found-container").classList.remove("hidden");
                    document.querySelector(".matchmake-container").classList.add("hidden");

                    setTimeout(() => navigateTo("/play/pong/" + data["id"]), 5000);
                }
            }
        };

        // setTime(0);

        // let timer = setInterval(() => {
        //     setTime(time() + 1);
        // }, 1000);
    }

    //     <li>
    //     <Duck />
    // </li>

    render() {
        return /* HTML */ `<HomeNavBar />
            <div id="toast-container"></div>
            <div class="matchmake-container">
                <ul>
                    <li>
                        <span class="searching-for-game">${tr("Searching for a game")}</span>
                    </li>
                    <li>
                        <span>
                            <span class="timer">${this.timeInMinutes()}</span>
                        </span>
                    </li>
                </ul>
                <div class="match-found-container hidden">
                    <div class="player-card">
                        <ul>
                            <li>
                                <img src="/favicon.svg" alt="" />
                            </li>
                            <li>
                                <span>test</span>
                            </li>
                        </ul>
                    </div>
                    <div class="vs-card">VS</div>
                    <div class="player-card">
                        <ul>
                            <li>
                                <img src="/favicon.svg" alt="" />
                            </li>
                            <li>
                                <span>test</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>`;
    }
}

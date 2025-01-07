import { getOriginNoProtocol, showToast } from "../utils";
import { navigateTo } from "../micro";
import { parseHTML } from "../micro";

/** @type {import("../micro").Component} */
export default async function PongMatchmake({ dom, stores, node }) {
    const GET = location.search
        .substring(1)
        .split("&")
        .map((value) => value.split("="))
        .reduce((obj, item) => ((obj[item[0]] = item[1]), obj), {});

    if (GET["gamemode"] == undefined) {
        navigateTo("/");
    }

    let time = 0;

    function timeInMinutes() {
        const minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);

        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return minutes + ":" + seconds;
    }

    dom.querySelector(".matchmake-container").do(async (c) => {
        const ws = new WebSocket(`wss://${getOriginNoProtocol()}:8080/ws/matchmake/pong`);
        ws.onopen = (event) => {
            ws.send(
                JSON.stringify({
                    type: "request",
                    gamemode: GET["gamemode"],
                })
            );
        };

        ws.onerror = (event) => {
            showToast("Cannot connect to game", "bi bi-exclamation-triangle-fill");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data["type"] == "matchFound") {
                document.querySelector(".match-found-container").classList.remove("hidden");
                document.querySelector(".matchmake-container").classList.add("hidden");
                if (GET["gamemode"].endsWith("local")) {
                    navigateTo("/play/pong/" + data["id"]);
                } else {
                    setTimeout(() => navigateTo("/play/pong/" + data["id"]), 5000);
                }
            }
        };

        setInterval(() => {
            time += 1;
            const timerDiv = c.querySelector(".timer");
            timerDiv.textContent = timeInMinutes();
        }, 1000);
    });

    return /* HTML */ `<NavBar />
        <div id="toast-container"></div>
        <div class="matchmake-container">
            <ul>
                <li>
                    <span class="searching-for-game">Searching for a game</span>
                </li>
                <li>
                    <span>
                        <span class="timer">${timeInMinutes()}</span>
                    </span>
                </li>
                <li>
                    <Duck />
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

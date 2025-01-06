import { getOriginNoProtocol } from "../utils";
import { navigateTo } from "../micro";
import { parseHTML } from "../micro";

/** @type {import("../micro").Component} */
export default async function PongMatchmake({ dom, stores }) {
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

    const duringMatchmakingCode = await parseHTML(
        /* HTML */ `<ul>
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
        </ul>`
    );

    const matchFoundCode = await parseHTML(
        /* HTML */ ` <div class="player-card">
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
            </div>`
    );

    dom.querySelector(".matchmake-container").do(async (c) => {
        c.appendChild(duringMatchmakingCode);

        const ws = new WebSocket(`wss://${getOriginNoProtocol()}:8080/ws/matchmake/pong`);
        ws.onopen = (event) => {
            ws.send(
                JSON.stringify({
                    type: "request",
                    gamemode: GET["gamemode"],
                })
            );
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data["type"] == "matchFound") {
                c.replaceChildren([]);
                c.appendChild(matchFoundCode);

                setTimeout(() => navigateTo("/play/pong/" + data["id"]), 5000);
            }
        };

        setInterval(() => {
            time += 1;
            const timerDiv = c.querySelector(".timer");
            timerDiv.textContent = timeInMinutes();
        }, 1000);
    });

    return /* HTML */ `<NavBar />
        <div class="matchmake-container"></div>`;
}

import { getOriginNoProtocol } from "../utils";
import { navigateTo } from "../micro";

/** @type {import("../micro").Component} */
export default async function PongMatchmake({ dom }) {
    const GET = location.search
        .substring(1)
        .split("&")
        .map((value) => value.split("="))
        .reduce((obj, item) => ((obj[item[0]] = item[1]), obj), {});

    if (GET["gamemode"] == undefined) {
        navigateTo("/");
    }

    dom.querySelector("#matchmake-container").do(() => {
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
                navigateTo("/play/pong/" + data["id"]);
            }
        };
    });

    return /* HTML */ `<div id="matchmake-container">
        <NavBar />
    </div>`;
}

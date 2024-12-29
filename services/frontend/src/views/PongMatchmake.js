import { getOriginNoProtocol } from "../utils";
import { Component, html } from "../micro";
import { navigateTo } from "../router";

export default class PongMatchmake extends Component {
    constructor() {
        super();
    }

    async render() {
        const GET = location.search
            .substring(1)
            .split("&")
            .map((value) => value.split("="))
            .reduce((obj, item) => ((obj[item[0]] = item[1]), obj), {});

        this.query("#matchmake-container").do(() => {
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

        return html(
            /* HTML */ `<div class="matchmake-container">
                <NavBar />
            </div>`
        );
    }
}

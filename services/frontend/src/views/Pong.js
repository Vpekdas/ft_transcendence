import { post } from "../api";
import { Component, globalComponents, html } from "../micro";
import { action } from "../game";

export default class Pong extends Component {
    constructor() {
        super();
    }

    // ctx.clearRect(x, y, canvas.width, canvas.height);
    // ctx.fillRect(x, y, canvas.width, canvas.height);
    // void ctx.arc(x, y, rayon, angleDépart, angleFin, sensAntiHoraire);

    async render() {
        const [port, setPort] = this.useGlobalStore("wsPort", 0);
        let id = "";

        this.query("#myCanvas").do(async (c) => {
            /** @type CanvasRenderingContext2D */
            var ctx = c.getContext("2d");

            var ws = new WebSocket(`ws://localhost:1972`);
            ws.onopen = (event) => {
                ws.send(JSON.stringify({ type: "matchmake", gamemode: "1v1local" }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type == "update" && data.id == id) {
                    const player1Y = data["player1"]["pos"]["y"];
                    const player2Y = data["player2"]["pos"]["y"];

                    const ballPos = data["ball"]["pos"];

                    const width = 20;
                    const height = 250;

                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, 1920, 780);

                    ctx.beginPath();
                    ctx.fillStyle = "yellow";
                    ctx.arc(ballPos.x, ballPos.y, 30, 0, 2 * Math.PI);
                    ctx.stroke();

                    ctx.fillStyle = "red";
                    ctx.fillRect(0, player1Y - height / 2, width, height);

                    ctx.fillStyle = "green";
                    ctx.fillRect(1900, player2Y - height / 2, width, height);
                } else if (data.type == "matchFound") {
                    id = data.id;
                }
            };

            let lastKey;

            window.addEventListener("keydown", (event) => {
                if (event.key == lastKey) return;

                if (event.key === "w") {
                    ws.send(JSON.stringify(action(id, "player1", "up", "press")));
                }
                if (event.key === "s") {
                    ws.send(JSON.stringify(action(id, "player1", "down", "press")));
                }
                if (event.key === "ArrowUp") {
                    ws.send(JSON.stringify(action(id, "player2", "up", "press")));
                }
                if (event.key === "ArrowDown") {
                    ws.send(JSON.stringify(action(id, "player2", "down", "press")));
                }

                lastKey = event.key;
            });

            window.addEventListener("keyup", (event) => {
                if (event.key === "w") {
                    ws.send(JSON.stringify(action(id, "player1", "up", "release")));
                }
                if (event.key === "s") {
                    ws.send(JSON.stringify(action(id, "player1", "down", "release")));
                }
                if (event.key === "ArrowUp") {
                    ws.send(JSON.stringify(action(id, "player2", "up", "release")));
                }
                if (event.key === "ArrowDown") {
                    ws.send(JSON.stringify(action(id, "player2", "down", "release")));
                }
                lastKey = undefined;
            });
        });

        return html(
            /* HTML */ ` <div>
                <NavBar />
                <canvas id="myCanvas" width="1920" height="780" style="border:1px solid #000000;"></canvas>
            </div>`
        );
    }
}
globalComponents.set("Pong", Pong);

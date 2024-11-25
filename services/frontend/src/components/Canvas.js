import { Component, globalComponents, html } from "../micro";

export default class GameCanvas extends Component {
    constructor() {
        super();
    }

    // ctx.clearRect(x, y, canvas.width, canvas.height);
    // ctx.fillRect(x, y, canvas.width, canvas.height);
    // void ctx.arc(x, y, rayon, angleDépart, angleFin, sensAntiHoraire);

    async render() {
        this.query("#myCanvas").do((c) => {
            var ctx = c.getContext("2d");

            var ws = new WebSocket("ws://localhost:1972");
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                const playerY = data["player1"]["pos"]["y"];

                ctx.clearRect(0, 0, 1920, 780);

                ctx.beginPath();
                ctx.arc(95, 50, 30, 0, 2 * Math.PI);
                ctx.stroke();

                ctx.fillStyle = "red";
                ctx.fillRect(0, playerY, 20, 250);

                ctx.fillStyle = "green";
                ctx.fillRect(1900, 20, 20, 250);
            };

            window.addEventListener("keydown", (event) => {
                console.log(event);
                if (event.key === "w") {
                    ws.send(JSON.stringify({ action: "move_up", player: "player1" }));
                }
                if (event.key === "s") {
                    ws.send(JSON.stringify({ action: "move_down", player: "player1" }));
                }
            });
        });

        return html(
            /* HTML */ ` <canvas id="myCanvas" width="1920" height="780" style="border:1px solid #000000;"></canvas>`
        );
    }
}
globalComponents.set("GameCanvas", GameCanvas);

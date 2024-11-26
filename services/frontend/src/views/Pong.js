import { post } from "../api";
import { Component, globalComponents, html } from "../micro";

export default class Pong extends Component {
    constructor() {
        super();
    }

    // ctx.clearRect(x, y, canvas.width, canvas.height);
    // ctx.fillRect(x, y, canvas.width, canvas.height);
    // void ctx.arc(x, y, rayon, angleDépart, angleFin, sensAntiHoraire);

    async render() {
        const id = this.attrib("id");
        const [port, setPort] = this.useGlobalStore("wsPort", 0);

        this.query("#myCanvas").do(async (c) => {
            if (port == 0) {
                const response = await post("/connect", { body: "{}" }, 1972).then((res) => res.json());
                const port = response["port"];
                setPort(port);
            }

            var ctx = c.getContext("2d");

            var ws = new WebSocket(`ws://localhost:${port}`);
            ws.onopen = (event) => {
                ws.send(JSON.stringify({ type: "matchmaking", mode: "1v1local" }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type == "update") {
                    const player1Y = data["player1"]["pos"]["y"];
                    const player2Y = data["player2"]["pos"]["y"];

                    const ballPos = data["ball"]["pos"];

                    const width = 20;
                    const height = 250;

                    ctx.clearRect(0, 0, 1920, 780);

                    ctx.beginPath();
                    ctx.arc(ballPos.x, ballPos.y, 30, 0, 2 * Math.PI);
                    ctx.stroke();

                    ctx.fillStyle = "red";
                    ctx.fillRect(0, player1Y - height / 2, width, height);

                    ctx.fillStyle = "green";
                    ctx.fillRect(1900, player2Y - height / 2, width, height);
                } else if (data.type == "matchFound") {
                }
            };

            window.addEventListener("keydown", (event) => {
                // console.log(event);
                if (event.key === "w") {
                    ws.send(JSON.stringify({ game: id, action: "move_up", player: "player1" }));
                }
                if (event.key === "s") {
                    ws.send(JSON.stringify({ game: id, action: "move_down", player: "player1" }));
                }
                if (event.key === "ArrowUp") {
                    ws.send(JSON.stringify({ game: id, action: "move_up", player: "player2" }));
                }
                if (event.key === "ArrowDown") {
                    ws.send(JSON.stringify({ game: id, action: "move_down", player: "player2" }));
                }
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

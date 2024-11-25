import { Component, globalComponents, html } from "../micro";

let playerY = 20;

window.addEventListener("keydown", (event) => {
    console.log(event);
    if (event.key === "w") {
        playerY--;
    }
    if (event.key === "s") {
        playerY++;
    }
});

export default class GameCanvas extends Component {
    constructor() {
        super();
    }

    // ctx.clearRect(x, y, canvas.width, canvas.height);
    // ctx.fillRect(x, y, canvas.width, canvas.height);
    // void ctx.arc(x, y, rayon, angleDépart, angleFin, sensAntiHoraire);

    async render() {
        return html(
            /* HTML */ ` <canvas id="myCanvas" width="1920" height="780" style="border:1px solid #000000;">
                <script>
                    var c = document.getElementById("myCanvas");
                    var ctx = c.getContext("2d");
                    ctx.beginPath();
                    ctx.arc(95, 50, 30, 0, 2 * Math.PI);
                    ctx.stroke();

                    ctx.fillStyle = "green";
                    ctx.fillRect(0, ${playerY}, 20, 250);

                    ctx.fillStyle = "green";
                    ctx.fillRect(1900, 20, 20, 250);
                </script></canvas
            >`
        );
    }
}
globalComponents.set("GameCanvas", GameCanvas);

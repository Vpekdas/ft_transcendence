import { post } from "../api";
import { Component, globalComponents, html } from "../micro";
import { action } from "../game";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// https://www.youtube.com/watch?v=Ou3Ykcp_-D8
// timestamp: 9:27
export default class Pong extends Component {
    constructor() {
        super();
    }

    async render() {
        const [port, setPort] = this.useGlobalStore("wsPort", 0);
        let id = "";

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        function addCube(x, y, width, height, color) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: color });
            const cube = new THREE.Mesh(geometry, material);

            cube.position.set(x, y, 0);
            cube.scale.set(width, height, 1);
            scene.add(cube);
            return cube;
        }

        function addSphere(x, y, radius = 1, widthSegments = 32, heightSegments = 16, color = 0xffffff) {
            const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
            const material = new THREE.MeshBasicMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry, material);

            sphere.position.set(x, y, 0);
            scene.add(sphere);
            return sphere;
        }

        this.query("#pong").do(async (c) => {
            c.appendChild(renderer.domElement);
            const controls = new OrbitControls(camera, c);

            camera.position.z = 5;
            renderer.setAnimationLoop(animate);

            const topWall = addCube(0, -5, 10, 1, "#008000");
            const botWall = addCube(0, 5, 10, 1, "#008000");

            const playerOne = addCube(-4, 0, 1, 3, "#cd1c18");
            const playerTne = addCube(4, 0, 1, 3, "#7f00ff");

            const ball = addSphere(0, 3, 0.5, 32, 16, "#ffde21");

            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }

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

                    // const width = 20;
                    // const height = 250;

                    // ctx.fillStyle = "white";
                    // ctx.fillRect(0, 0, 1920, 780);

                    // ctx.beginPath();
                    // ctx.fillStyle = "yellow";
                    // ctx.arc(ballPos.x, ballPos.y, 30, 0, 2 * Math.PI);
                    // ctx.stroke();

                    // ctx.fillStyle = "red";
                    // ctx.fillRect(0, player1Y - height / 2, width, height);

                    // ctx.fillStyle = "green";
                    // ctx.fillRect(1900, player2Y - height / 2, width, height);
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
                <div id="pong" width="1920" height="780" style="border:1px solid #000000;"></div>
            </div>`
        );
    }
}
globalComponents.set("Pong", Pong);

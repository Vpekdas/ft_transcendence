import { post } from "../api";
import { Component, globalComponents, html } from "../micro";
import { action } from "../game";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function addCube(scene, x, y, width, height, color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(x, y, 0);
    cube.scale.set(width, height, 1);
    scene.add(cube);
    return cube;
}

function addSphere(scene, x, y, radius, widthSegments, heightSegments, color) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(x, y, 0);
    scene.add(sphere);
    return sphere;
}

function debuggingBox(scene, object3D) {
    const box = new THREE.BoxHelper(object3D, 0xffff00);
    scene.add(box);
    return box;
}

export default class Pong extends Component {
    constructor() {
        super();
    }

    async render() {
        const [port, setPort] = this.useGlobalStore("wsPort", 0);
        let id = "";

        this.query("#pong").do(async (c) => {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(125, c.clientWidth / c.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();

            renderer.setSize(c.clientWidth, c.clientHeight);

            window.addEventListener("resize", onWindowResize, false);

            function onWindowResize() {
                renderer.setSize(c.clientWidth, c.clientHeight);
                camera.aspect = c.clientWidth / c.clientHeight;
                camera.updateProjectionMatrix();
            }

            c.appendChild(renderer.domElement);
            const controls = new OrbitControls(camera, c);

            camera.position.z = 5;
            renderer.setAnimationLoop(animate);

            const boxHelpers = [];

            const topWall = addCube(scene, 0, -5, 10, 1, "#008000");
            boxHelpers.push(debuggingBox(scene, topWall));

            const botWall = addCube(scene, 0, 5, 10, 1, "#008000");
            boxHelpers.push(debuggingBox(scene, botWall));

            const playerOne = addCube(scene, -4, 0, 1, 3, "#cd1c18");
            boxHelpers.push(debuggingBox(scene, playerOne));

            const playerTwo = addCube(scene, 4, 0, 1, 3, "#7f00ff");
            boxHelpers.push(debuggingBox(scene, playerTwo));

            const ball = addSphere(scene, 0, 3, 0.5, 32, 16, "#ffde21");
            boxHelpers.push(debuggingBox(scene, ball));

            function addStar() {
                const geometry = new THREE.SphereGeometry(0.25, 24, 24);
                const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const star = new THREE.Mesh(geometry, material);

                const [x, y, z] = Array(3)
                    .fill()
                    .map(() => THREE.MathUtils.randFloatSpread(100));
                star.position.set(x, y, z);
                scene.add(star);
            }

            Array(200).fill().forEach(addStar);

            const spaceTexture = new THREE.TextureLoader().load("/img/space.jpg");
            scene.background = spaceTexture;

            // requestAnimationFrame is supposed to provide a better efficient loop for rendering.
            function animate() {
                for (let i = 0; i < boxHelpers.length; i++) {
                    boxHelpers[i].update();
                }
                controls.update();
                renderer.render(scene, camera);
            }

            var ws = new WebSocket(`ws://localhost:8000/ws`);
            ws.onopen = (event) => {
                ws.send(JSON.stringify({ type: "matchmake", gamemode: "1v1local" }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type == "update" && data.id == id) {
                    for (let body of data["bodies"]) {
                        if (body["name"] == "player1") {
                            playerOne.position.y = body["pos"]["y"];
                        } else if (body["name"] == "player2") {
                            playerTwo.position.y = body["pos"]["y"];
                        } else if (body["name"] == "Ball") {
                            ball.position.x = body["pos"]["x"];
                            ball.position.y = body["pos"]["y"];
                            ball.position.z = body["pos"]["z"];
                        }
                    }
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
                <div id="pong"></div>
            </div>`
        );
    }
}
globalComponents.set("Pong", Pong);

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
    return cube;
}

function addSphere(scene, x, y, radius, widthSegments, heightSegments, color) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(x, y, 0);
    return sphere;
}

function debuggingBox2(scene, position, width, height) {
    const box = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(width, height, 1)), 0xffff00);
    box.object.position.x = position["x"];
    box.object.position.y = position["y"];
    box.object.position.z = position["z"];
    return box;
}

export default class Pong extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query("#pong").do(async (c) => {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();

            renderer.setSize(c.clientWidth, c.clientHeight);

            window.addEventListener("resize", onWindowResize, false);

            function onWindowResize() {
                renderer.setSize(c.clientWidth, c.clientHeight);
                camera.aspect = c.clientWidth / c.clientHeight;
                camera.updateProjectionMatrix();
            }

            /** @type Map<string, any> */
            let bodies = new Map();
            let boxes = new Map();

            const DEBUG = true;

            function createBody(type, id, shape, position) {
                let body = undefined;

                if (type == "Ball") {
                    body = addSphere(scene, position["x"], position["y"], 0.5, 32, 16, "#ffde21");
                } else if (type == "Player") {
                    body = addCube(scene, position["x"], position["y"], 1, 3, "#cd1c18");
                } /* else if (type == "Wall") {
                    body = addCube(scene, position["x"], position["y"], 10, 1, "#008000");
                }*/ else {
                    body = addCube(scene, 0, 0, 0, 0, "#000000");
                }

                if (DEBUG) {
                    let box;
                    if (shape["type"] == "Box") {
                        box = debuggingBox2(
                            scene,
                            position,
                            shape["max"]["x"] - shape["min"]["x"],
                            shape["max"]["y"] - shape["min"]["y"]
                        );
                        boxes.set(id, box);
                        scene.add(box);
                    }
                }

                return body;
            }

            function onUpdateReceived(data) {
                for (let body of data["bodies"]) {
                    if (bodies.has(body["id"])) {
                        let lbody = bodies.get(body["id"]);
                        lbody.position.x = body["pos"]["x"];
                        lbody.position.y = body["pos"]["y"];
                        lbody.position.z = body["pos"]["z"];

                        if (DEBUG && boxes.has(body["id"])) {
                            let box = boxes.get(body["id"]);
                            box.object.position.x = body["pos"]["x"];
                            box.object.position.y = body["pos"]["y"];
                            box.object.position.z = body["pos"]["z"];
                        }
                    } else {
                        const lbody = createBody(body["type"], body["id"], body["shape"], body["pos"]);
                        if (lbody != undefined) {
                            bodies.set(body["id"], lbody);
                            scene.add(lbody);
                        }
                    }
                }
            }

            c.appendChild(renderer.domElement);
            const controls = new OrbitControls(camera, c);

            camera.position.z = 10;
            camera.position.y = -2;
            renderer.setAnimationLoop(animate);

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
                for (let [key, value] of boxes) {
                    value.update();
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

                if (data.type == "update") {
                    onUpdateReceived(data);
                } else if (data.type == "matchFound") {
                }
            };

            let lastKey;

            window.addEventListener("keydown", (event) => {
                if (event.key == lastKey) return;

                if (event.key === "w") {
                    ws.send(JSON.stringify(action("player1", "up", "press")));
                }
                if (event.key === "s") {
                    ws.send(JSON.stringify(action("player1", "down", "press")));
                }
                if (event.key === "ArrowUp") {
                    ws.send(JSON.stringify(action("player2", "up", "press")));
                }
                if (event.key === "ArrowDown") {
                    ws.send(JSON.stringify(action("player2", "down", "press")));
                }

                lastKey = event.key;
            });

            window.addEventListener("keyup", (event) => {
                if (event.key === "w") {
                    ws.send(JSON.stringify(action("player1", "up", "release")));
                }
                if (event.key === "s") {
                    ws.send(JSON.stringify(action("player1", "down", "release")));
                }
                if (event.key === "ArrowUp") {
                    ws.send(JSON.stringify(action("player2", "up", "release")));
                }
                if (event.key === "ArrowDown") {
                    ws.send(JSON.stringify(action("player2", "down", "release")));
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

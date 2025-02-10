import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { getOriginNoProtocol } from "../utils";
import { Component, params } from "../micro";

class TerrainSkin {
    constructor(name, model) {
        this.name = name;
        this.model = model;
    }

    update() {}
}

class BallSkin {
    constructor(name, model) {
        this.name = name;
        this.model = model;
    }
}

/** @type {Map<string, TerrainSkin>} */
let terrainSkins = new Map();
/** @type {Map<string, BallSkin>} */
let ballSkins = new Map();

function registerAllSkins() {
    // Terrain skins
    terrainSkins.set("brittle-hollow", new TerrainSkin("brittle-hollow", "/models/Test.glb"));

    // Ball skins
}

function createCube(x, y, width, height, color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(x, y, 0);
    cube.scale.set(width, height, 1);
    return cube;
}

function createSphere(x, y, radius, widthSegments, heightSegments, color) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(x, y, 0);
    sphere.scale.set(1.0, 1.0, 1.0);
    return sphere;
}

function debuggingBox2(position, width, height) {
    const box = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(width, height, 1)), 0xffff00);
    box.object.position.x = position["x"];
    box.object.position.y = position["y"];
    box.object.position.z = position["z"];
    return box;
}

const DEBUG = true;

export function action(subId, actionName, actionType) {
    return { type: "input", playerSubId: subId, action_name: actionName, action: actionType };
}

export default class Pong extends Component {
    async setupGameTerrain() {
        const terrain = await this.modelLoader.loadAsync(this.skin.model);

        const terrainSceneRight = terrain.scene;
        terrainSceneRight.rotation.set(Math.PI / 2, 0, 0);
        terrainSceneRight.position.set(13, 0, -2);
        this.scene.add(terrainSceneRight);

        const terrainSceneLeft = terrain.scene.clone();
        terrainSceneLeft.rotation.set(Math.PI / 2, Math.PI, 0);
        terrainSceneLeft.position.set(-13, 0, -2);
        this.scene.add(terrainSceneLeft);

        let lastKey;

        window.addEventListener("keydown", (event) => {
            if (event.key == lastKey) return;

            if (event.key === "w") {
                this.ws.send(JSON.stringify(action("player1", "up", "press")));
            }
            if (event.key === "s") {
                this.ws.send(JSON.stringify(action("player1", "down", "press")));
            }
            if (event.key === "ArrowUp") {
                this.ws.send(JSON.stringify(action("player2", "up", "press")));
            }
            if (event.key === "ArrowDown") {
                this.ws.send(JSON.stringify(action("player2", "down", "press")));
            }

            lastKey = event.key;
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "w") {
                this.ws.send(JSON.stringify(action("player1", "up", "release")));
            }
            if (event.key === "s") {
                this.ws.send(JSON.stringify(action("player1", "down", "release")));
            }
            if (event.key === "ArrowUp") {
                this.ws.send(JSON.stringify(action("player2", "up", "release")));
            }
            if (event.key === "ArrowDown") {
                this.ws.send(JSON.stringify(action("player2", "down", "release")));
            }
            lastKey = undefined;
        });
    }

    createBody(type, id, shape, position) {
        let body = undefined;

        if (type == "Ball") {
            body = createSphere(position["x"], position["y"], 0.5, 32, 16, "#ffde21");
        } else if (type == "Player") {
            body = createCube(position["x"], position["y"], this.playerWidth, this.playerHeight, "#cd1c18");
        } else {
            body = createCube(0, 0, 0, 0, "#000000");
        }

        if (DEBUG) {
            let box;
            if (shape["type"] == "Box") {
                box = debuggingBox2(
                    position,
                    shape["max"]["x"] - shape["min"]["x"],
                    shape["max"]["y"] - shape["min"]["y"]
                );
                this.boxes.set(id, box);
                this.scene.add(box);
            }
        }

        return body;
    }

    onUpdateReceived(data) {
        for (let body of data["bodies"]) {
            if (this.bodies.has(body["id"])) {
                let lbody = this.bodies.get(body["id"]);
                lbody.position.x = body["pos"]["x"];
                lbody.position.y = body["pos"]["y"];
                lbody.position.z = body["pos"]["z"];

                if (DEBUG && this.boxes.has(body["id"])) {
                    let box = this.boxes.get(body["id"]);
                    box.object.position.x = body["pos"]["x"];
                    box.object.position.y = body["pos"]["y"];
                    box.object.position.z = body["pos"]["z"];
                }
            } else {
                const lbody = this.createBody(body["type"], body["id"], body["shape"], body["pos"]);
                if (lbody != undefined) {
                    this.bodies.set(body["id"], lbody);
                    this.scene.add(lbody);
                }
            }
        }

        let score1 = data["scores"][0];
        let score2 = data["scores"][1];

        document.getElementById("score1").textContent = score1;
        document.getElementById("score2").textContent = score2;
    }

    async onMessage(data) {
        const id = params.get("id");

        if (data.type == "update" && id != null) {
            this.onUpdateReceived(data);
        } else if (data.type == "winner" && !gameEnded) {
            gameEnded = true;

            // TODO
        } else if (data["type"] == "redirectTournament") {
            navigateTo(`/tournament/${data["id"]}`);
        } else if (data["type"] == "countdown") {
            console.log("countdown:", data["value"], "...");
        } else if (data["type"] == "started") {
            this.gameStarted = true;
        }
    }

    /* UI */

    async init() {
        const id = params.get("id");

        /** @type {THREE.Scene} */
        this.scene = new THREE.Scene();

        this.bodies = new Map();
        this.boxes = new Map();

        this.playerWidth = 1.0;
        this.playerHeight = 5.0;

        this.textureLoader = new THREE.TextureLoader();
        this.fontLoader = new FontLoader();
        this.modelLoader = new GLTFLoader();

        this.font = await this.fontLoader.loadAsync("/fonts/TakaoMincho_Regular.json");

        this.gameStarted = false;

        registerAllSkins();

        this.skin = terrainSkins.get("brittle-hollow");

        // const lava = await this.modelLoader.loadAsync("/models/Lava.glb");
        // this.scene.add(lava.scene);

        this.onready = () => {
            const c = document.getElementById("pong");

            let camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
            let renderer = new THREE.WebGLRenderer();

            renderer.setSize(c.clientWidth, c.clientHeight);

            window.addEventListener(
                "resize",
                () => {
                    renderer.setSize(c.clientWidth, c.clientHeight);
                    camera.aspect = c.clientWidth / c.clientHeight;
                    camera.updateProjectionMatrix();
                },
                false
            );

            c.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, c);

            camera.position.z = 20;
            camera.position.y = -15;

            if (!DEBUG) {
                controls.enableRotate = false;
                controls.enablePan = false;
                controls.enableZoom = false;
                controls.enableDamping = false;
            }

            renderer.setAnimationLoop(() => {
                for (let [key, value] of this.boxes) {
                    value.update();
                }
                controls.update();
                renderer.render(this.scene, camera);
            });

            Array(200)
                .fill()
                .forEach(() => {
                    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
                    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                    const star = new THREE.Mesh(geometry, material);

                    const [x, y, z] = Array(3)
                        .fill()
                        .map(() => THREE.MathUtils.randFloatSpread(100));
                    star.position.set(x, y, z);
                    this.scene.add(star);
                });

            const spaceTexture = this.textureLoader.load("/img/space.jpg");
            this.scene.background = spaceTexture;

            // ! For ground, It seems ok but may not be ok for other models.
            const ambientLight = new THREE.AmbientLight(0xffffff, 10);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(0, -20, 20);
            this.scene.add(directionalLight);

            // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
            // scene.add(directionalLightHelper);

            this.ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/pong/${id}`);
            this.ws.onopen = async (event) => {
                await this.setupGameTerrain();
            };
            // ws.onerror = (event) => {
            //     showToast(tr("Cannot connect to the game"), "bi bi-exclamation-triangle-fill");
            // };
            this.ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                await this.onMessage(data);
            };
        };
    }

    render() {
        let ui = /* HTML */ `<div class="ui">
            <span class="score" id="score1">0</span>
            <span class="vs"> - </span>
            <span class="score" id="score2">0</span>
        </div>`;

        return /* HTML */ ` <HomeNavBar />
            <div id="pong">
                <div id="pong-overlay">${ui}</div>
            </div>`;
    }
}

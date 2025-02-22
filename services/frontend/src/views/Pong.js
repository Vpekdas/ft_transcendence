import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { getOriginNoProtocol, post } from "../utils";
import { Component, dirty, params } from "../micro";
import { tr } from "../i18n";
import BrittleHollow from "./Test";

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
    const material = new THREE.MeshToonMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(x, y, 0);
    cube.scale.set(width, height, 1);
    return cube;
}

function createSphere(x, y, radius, widthSegments, heightSegments, color) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshToonMaterial({ color: color });
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
    async initBrittleHollow() {
        const assets = new Map();

        const groundLeft = await this.BrittleClass.initGround(-12.5, 0, -1.2);
        assets.set("GroundLeft", groundLeft);

        const groundRight = await this.BrittleClass.initGround(12.5, 0, -1.2);
        assets.set("GroundRight", groundRight);

        const quantumShard = await this.BrittleClass.initQuantumShard(0, 0, 0);
        assets.set("QuantumShard", quantumShard);

        const campfire = await this.BrittleClass.initCampfire(0, 0, 0);
        assets.set("Campfire", campfire);

        const deadTree = await this.BrittleClass.initDeadTree(0, 0, 0);
        assets.set("DeadTree", deadTree);

        this.fireCustomShaderMaterial = await this.BrittleClass.initFireShader();
        const meteorite = await this.BrittleClass.initMeteorite(0, 0, 0, this.fireCustomShaderMaterial);
        assets.set("Meteorite", meteorite);

        const ball = await this.BrittleClass.initBall(0, 0, 0);
        assets.set("Ball", ball);

        this.basePosition = new THREE.Vector3(-22, 10, 0);

        const particleSystem = await this.BrittleClass.initParticle(this.scene);
        assets.set("ParticleSystem", particleSystem);

        return assets;
    }

    async setupGameTerrain() {
        const terrain = await this.modelLoader.loadAsync(this.skin.model);

        const terrainSceneRight = terrain.scene;
        terrainSceneRight.rotation.set(Math.PI / 2, 0, 0);
        terrainSceneRight.position.set(13, 0, -2);

        // ! Add an If statement or find a proper way.
        this.scene.add(this.brittle.get("GroundLeft"));

        const terrainSceneLeft = terrain.scene.clone();
        terrainSceneLeft.rotation.set(Math.PI / 2, Math.PI, 0);
        terrainSceneLeft.position.set(-13, 0, -2);

        this.scene.add(this.brittle.get("GroundRight"));

        this.brittle.get("QuantumShard").rotation.set(-300, 0, 0);
        this.brittle.get("QuantumShard").position.set(-22, 0, -1);
        this.scene.add(this.brittle.get("QuantumShard"));

        this.brittle.get("Campfire").rotation.set(-300, 0, 0);
        this.brittle.get("Campfire").position.set(-22, 10, -0.5);
        this.scene.add(this.brittle.get("Campfire"));

        this.brittle.get("DeadTree").rotation.set(-300, 0, 0);
        this.brittle.get("DeadTree").position.set(-22, -10, -0.6);
        this.scene.add(this.brittle.get("DeadTree"));

        this.brittle.get("Meteorite").rotation.set(0, 0, 0);
        this.brittle.get("Meteorite").position.set(0, 15, 0);
        this.scene.add(this.brittle.get("Meteorite"));

        let lastKey;

        window.addEventListener("keydown", (event) => {
            if (location.pathname.startsWith("/play/pong/")) event.preventDefault();
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
            // body = createSphere(position["x"], position["y"], 0.5, 32, 16, "#ffde21");
            // ! Add an If statement or find a proper way.
            body = this.brittle.get("Ball");
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
        } else if (data.type == "gameEnded" && !this.gameEnded) {
            this.gameEnded = true;
            this.winner = data.winner;
            this.score1 = data.score1;
            this.score2 = data.score2;

            let winnerText = "";

            if (this.gamemode == "1v1local") {
                if (this.score1 > this.score2) {
                    winnerText = tr("Left side won !");
                } else {
                    winnerText = tr("Right side won !");
                }
            } else if (this.winner == this.info["id"]) {
                winnerText = tr("You win !");
            } else {
                winnerText = tr("You loose :(");
            }

            let gameover = /* HTML */ ` <li>
                    <span>${winnerText}</span>
                </li>
                <li>
                    <a href="/">${tr("Back to home")}</a>
                </li>`;

            document.querySelector(".ui-list").innerHTML += gameover;
        } else if (data["type"] == "redirectTournament") {
            navigateTo(`/tournament/${data["id"]}`);
        } else if (data["type"] == "countdown") {
            console.log("countdown:", data["value"], "...");
        } else if (data["type"] == "started") {
            this.gameStarted = true;
        }

        if (data.gamemode) {
            this.gamemode = data.gamemode;
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
        this.gameEnded = false;

        this.BrittleClass = new BrittleHollow();
        this.brittle = await this.initBrittleHollow();

        registerAllSkins();

        this.skin = terrainSkins.get("brittle-hollow");

        this.info = await post("/api/player/c/profile", {}).then((res) => res.json());

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

            // ! Ensure It's applied only on Brittle Hollow map.
            renderer.toneMapping = THREE.ReinhardToneMapping;
            renderer.toneMappingExposure = 0.3;

            const ballComposer = new EffectComposer(renderer);
            const ballRenderPass = new RenderPass(this.scene, camera);
            ballComposer.addPass(ballRenderPass);

            const bloomPass = new UnrealBloomPass(new THREE.Vector2(c.clientWidth, c.clientHeight), 1.5, 0.4, 0.85);
            ballComposer.addPass(bloomPass);

            const particleSystem = this.brittle.get("ParticleSystem");

            this.start = Date.now();
            this.previousTime = performance.now();

            renderer.setAnimationLoop(() => {
                for (let [key, value] of this.boxes) {
                    value.update();
                }
                controls.update();

                this.currentTime = performance.now();
                this.timeElapsed = (this.currentTime - this.previousTime) / 1000;
                this.previousTime = this.currentTime;
                particleSystem.step(this.timeElapsed, this.basePosition);

                this.fireCustomShaderMaterial.uniforms["time"].value = 0.00025 * (Date.now() - this.start);

                renderer.render(this.scene, camera);
                ballComposer.render(this.scene, camera);
            });

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

    async clean() {}

    render() {
        let ui = /* HTML */ `<div class="ui">
            <ul class="ui-list">
                <li>
                    <span class="score" id="score1">0</span>
                    <span class="vs"> - </span>
                    <span class="score" id="score2">0</span>
                </li>
            </ul>
        </div>`;

        return /* HTML */ ` <HomeNavBar />
            <div id="pong">
                <div id="pong-overlay">${ui}</div>
            </div>`;
    }
}

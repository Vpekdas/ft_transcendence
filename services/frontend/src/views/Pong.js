import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { getOriginNoProtocol, post } from "../utils";
import { Component, dirty, params } from "../micro";
import { tr } from "../i18n";
import BrittleHollow from "./Test";

async function loadShaderFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader file: ${url}`);
    }
    return await response.text();
}

class TerrainSkin {
    constructor(name) {
        this.name = name;
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     */
    async init(gltfLoader, scene) {}

    async update() {}
}

class BrittleHollowSkin extends TerrainSkin {
    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     */
    async init(gltfLoader, scene) {
        this.piece = (await gltfLoader.loadAsync("/models/BrittleHollow/BrittleHollowTerrainPiece.glb")).scene;
        this.piece.children[0].material = new THREE.ShaderMaterial({
            vertexShader: await loadShaderFile("/models/BrittleHollow/TerrainPiece.vert"),
            fragmentShader: await loadShaderFile("/models/BrittleHollow/TerrainPiece.frag"),
        });

        this.piece.rotation.x = Math.PI / 2;
        this.piece.rotation.y = Math.PI / 2;

        const scale = 2.0;

        const totalCellHeight = 9;
        const totalHeight = 1.73 * totalCellHeight * scale;

        const totalCellWidth = 9 * 2;
        const totalWidth = totalCellWidth * 1.5 * scale;

        const offsetX = -totalWidth / 2;
        const offsetY = -totalHeight / 2 + (1.73 * scale) / 2;

        this.createBigRow(0, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(1, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(2, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(3, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(4, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(5, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(6, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(7, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(8, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(9, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(10, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(11, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(12, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(13, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(14, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(15, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(16, totalCellHeight, scene, offsetX, offsetY, scale);
        this.createSmallRow(17, totalCellHeight - 1, scene, offsetX, offsetY, scale);
        this.createBigRow(18, totalCellHeight, scene, offsetX, offsetY, scale);
    }

    randomHeight() {
        return Math.random() * 0.3;
    }

    createBigRow(x, height, scene, offsetX, offsetY, scale) {
        for (let i = 0; i < height; i++) {
            let piece2 = this.piece.clone();
            piece2.position.x = x * 1.5 * scale + offsetX;
            piece2.position.y = 1.73 * i * scale + offsetY;
            piece2.position.z = -this.randomHeight() - 2.6;

            piece2.scale.set(scale, scale, scale);

            scene.add(piece2);
        }
    }

    createSmallRow(x, height, scene, offsetX, offsetY, scale) {
        for (let i = 0; i < height; i++) {
            let piece2 = this.piece.clone();
            piece2.position.x = x * 1.5 * scale + offsetX;
            piece2.position.y = 1.73 * i * scale + (1.73 * scale) / 2.0 + offsetY;
            piece2.position.z = -this.randomHeight() - 2.6;

            piece2.scale.set(scale, scale, scale);

            scene.add(piece2);
        }
    }

    async update() {}
}

class BallSkin {
    constructor(name) {
        this.name = name;
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     */
    async init(gltfLoader, scene) {}
}

class LavaBallSkin {
    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     */
    async init(gltfLoader, scene) {}
}

/** @type {Map<string, TerrainSkin>} */
let terrainSkins = new Map();
/** @type {Map<string, BallSkin>} */
let ballSkins = new Map();

function registerAllSkins() {
    // Terrain skins
    terrainSkins.set("colorful-terrain", new TerrainSkin("colorful-terrain"));
    terrainSkins.set("brittle-hollow", new BrittleHollowSkin("brittle-hollow"));

    // Ball skins
    terrainSkins.set("colorful-ball", new TerrainSkin("colorful-ball"));
    ballSkins.set("lava-ball", new LavaBallSkin("lava-ball"));
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
        await this.skin.init(this.gltfLoader, this.scene);

        // const terrainSceneRight = terrain.scene;
        // terrainSceneRight.rotation.set(Math.PI / 2, 0, 0);
        // terrainSceneRight.position.set(13, 0, -2);

        // // ! Add an If statement or find a proper way.
        // this.scene.add(this.brittle.get("GroundLeft"));

        // const terrainSceneLeft = terrain.scene.clone();
        // terrainSceneLeft.rotation.set(Math.PI / 2, Math.PI, 0);
        // terrainSceneLeft.position.set(-13, 0, -2);

        // this.scene.add(this.brittle.get("GroundRight"));

        // this.brittle.get("QuantumShard").rotation.set(-300, 0, 0);
        // this.brittle.get("QuantumShard").position.set(-22, 0, -1);
        // this.scene.add(this.brittle.get("QuantumShard"));

        // this.brittle.get("Campfire").rotation.set(-300, 0, 0);
        // this.brittle.get("Campfire").position.set(-22, 10, -0.5);
        // this.scene.add(this.brittle.get("Campfire"));

        // this.brittle.get("DeadTree").rotation.set(-300, 0, 0);
        // this.brittle.get("DeadTree").position.set(-22, -10, -0.6);
        // this.scene.add(this.brittle.get("DeadTree"));

        // this.brittle.get("Meteorite").rotation.set(0, 0, 0);
        // this.brittle.get("Meteorite").position.set(0, 15, 0);
        // this.scene.add(this.brittle.get("Meteorite"));

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
            body = createSphere(position["x"], position["y"], 0.5, 32, 16, "#ffde21");
            // ! Add an If statement or find a proper way.
            // body = this.brittle.get("Ball");
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
        this.gltfLoader = new GLTFLoader();

        this.gameStarted = false;
        this.gameEnded = false;

        registerAllSkins();

        this.skin = terrainSkins.get("brittle-hollow");
        this.info = await post("/api/player/c/profile", {}).then((res) => res.json());

        this.onready = async () => {
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

            await this.setupGameTerrain();

            // ! Ensure It's applied only on Brittle Hollow map.
            // renderer.toneMapping = THREE.ReinhardToneMapping;
            // renderer.toneMappingExposure = 0.3;

            // const ballComposer = new EffectComposer(renderer);
            // const ballRenderPass = new RenderPass(this.scene, camera);
            // ballComposer.addPass(ballRenderPass);

            // const bloomPass = new UnrealBloomPass(new THREE.Vector2(c.clientWidth, c.clientHeight), 1.5, 0.4, 0.85);
            // ballComposer.addPass(bloomPass);

            // const particleSystem = this.brittle.get("ParticleSystem");

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
                // particleSystem.step(this.timeElapsed, this.basePosition);

                // this.fireCustomShaderMaterial.uniforms["time"].value = 0.00025 * (Date.now() - this.start);

                renderer.render(this.scene, camera);
                // ballComposer.render(this.scene, camera);
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

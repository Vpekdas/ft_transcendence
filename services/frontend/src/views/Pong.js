import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { getOriginNoProtocol, post } from "../utils";
import { Component, dirty, params, navigateTo } from "../micro";
import { tr } from "../i18n";

async function loadShaderFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader file: ${url}`);
    }
    return await response.text();
}

/** Terrain skins */

class TerrainSkin {
    constructor(name) {
        this.name = name;
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     */
    async init(gltfLoader, exrLoader, scene) {}

    async update() {}
}

class ColorfulTerrainSkin extends TerrainSkin {
    constructor() {
        super("colorful-terrain");
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     */
    async init(gltfLoader, exrLoader, scene) {
        const wallTop = createCube(0, -12.4, 36, 0.4, 0.5, "green");
        const wallBottom = createCube(0, 12.4, 36, 0.4, 0.5, "green");

        scene.add(wallTop);
        scene.add(wallBottom);
    }
}

class BrittleHollowSkin extends TerrainSkin {
    constructor() {
        super("brittle-hollow");
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     */
    async init(gltfLoader, exrLoader, scene, bhMaterial) {
        let texture = await exrLoader.loadAsync("/models/BrittleHollow/4k.exr");

        texture.mapping = THREE.EquirectangularReflectionMapping;

        this.piece = (await gltfLoader.loadAsync("/models/BrittleHollow/BrittleHollowTerrainPiece.glb")).scene;
        this.piece.children[0].material = bhMaterial;

        const envTexture = texture.clone();
        const bgTexture = texture.clone();

        scene.environment = envTexture;
        scene.background = bgTexture;

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

        const wallTop = createCube(0, -12.4, 36, 0.4, 0.5, "#1b293a");
        const wallBottom = createCube(0, 12.4, 36, 0.4, 0.5, "#1b293a");

        scene.add(wallTop);
        scene.add(wallBottom);
    }

    randomHeight() {
        return Math.random() * 0.7;
    }

    createBigRow(x, height, scene, offsetX, offsetY, scale) {
        for (let i = 0; i < height; i++) {
            let piece2 = this.piece.clone();
            piece2.position.x = x * 1.5 * scale + offsetX;
            piece2.position.y = -this.randomHeight() - 2.6;
            piece2.position.z = 1.73 * i * scale + offsetY;

            piece2.scale.set(scale, scale, scale);

            scene.add(piece2);
        }
    }

    createSmallRow(x, height, scene, offsetX, offsetY, scale) {
        for (let i = 0; i < height; i++) {
            let piece2 = this.piece.clone();
            piece2.position.x = x * 1.5 * scale + offsetX;
            piece2.position.y = -this.randomHeight() - 2.6;
            piece2.position.z = 1.73 * i * scale + (1.73 * scale) / 2.0 + offsetY;

            piece2.scale.set(scale, scale, scale);

            scene.add(piece2);
        }
    }

    async update() {}
}

/** Ball skins */

class BallSkin {
    constructor(name) {
        this.name = name;
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     * @returns {Promise<THREE.Object3D>}
     */
    async init(gltfLoader, scene) {}
}

class ColorfulBallSkin extends BallSkin {
    constructor() {
        super("colorful-ball");
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     * @returns {THREE.Object3D}
     */
    async init(gltfLoader, scene) {
        return createSphere(0, 0, 0.5, 32, 16, "#ffde21");
    }
}

class LavaBallSkin extends BallSkin {
    constructor() {
        super("lava-ball");
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     * @returns {THREE.Object3D}
     */
    async init(gltfLoader, scene) {
        const ballCustomShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: await loadShaderFile("/models/BrittleHollow/Ball/vertexShader.glsl"),
            fragmentShader: await loadShaderFile("/models/BrittleHollow/Ball/fragmentShader.glsl"),
            uniforms: {
                emissiveIntensity: { value: 15.0 },
            },
        });

        const geometry = new THREE.SphereGeometry(0.5);
        const ball = new THREE.Mesh(geometry, ballCustomShaderMaterial);

        // ball.position.set(x, y, z);
        return ball;
    }
}

/** Bar skins */

class BarSkin {
    constructor(name) {
        this.name = name;
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     * @returns {Promise<THREE.Object3D>}
     */
    async init(gltfLoader, exrLoader, scene) {}
}

class ColorfulBarSkin extends BarSkin {
    constructor() {
        super("colorful-bar");
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     * @returns {THREE.Object3D}
     */
    async init(gltfLoader, exrLoader, scene) {
        return createCube(0, 0, 1.0, 1.0, 5.0, "#cd1c18");
    }
}

class BrittleHollowBarSkin extends BarSkin {
    constructor() {
        super("brittle-hollow-bar");
    }

    /**
     * @param {GLTFLoader} gltfLoader
     * @param {THREE.Scene} scene
     * @returns {THREE.Object3D}
     */
    async init(gltfLoader, exrLoader, scene, bhMaterial) {
        /** @type {THREE.Object3D} */
        const object = (await gltfLoader.loadAsync("/models/BrittleHollow/BrittleHollowPlayer.glb")).scene;

        object.rotation.x = Math.PI / 2;
        object.rotation.z = -Math.PI / 2;

        object.traverse((obj) => {
            obj.material = bhMaterial;
        });

        return object;
    }
}

/** @type {Map<string, TerrainSkin>} */
let terrainSkins = new Map();
/** @type {Map<string, BallSkin>} */
let ballSkins = new Map();
/** @type {Map<string, BarSkin>} */
let barSkins = new Map();

function registerAllSkins() {
    // Terrain skins
    terrainSkins.set("colorful-terrain", new ColorfulTerrainSkin());
    terrainSkins.set("brittle-hollow", new BrittleHollowSkin());

    // Ball skins
    ballSkins.set("colorful-ball", new ColorfulBallSkin());
    ballSkins.set("lava-ball", new LavaBallSkin());

    // Bar skins
    barSkins.set("colorful-bar", new ColorfulBarSkin());
    barSkins.set("brittle-hollow", new BrittleHollowBarSkin());
}

function createCube(x, y, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshToonMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(x, 0, y);
    cube.scale.set(width, height, depth);
    return cube;
}

function createSphere(x, y, radius, widthSegments, heightSegments, color) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshToonMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(x, 0, y);
    sphere.scale.set(1.0, 1.0, 1.0);

    return sphere;
}

function debuggingBox2(position, width, height) {
    const box = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(width, 1, height)), 0xffff00);
    box.object.position.x = position["x"];
    box.object.position.y = position["z"];
    box.object.position.z = position["y"];
    return box;
}

const DEBUG = false;

export function action(subId, actionName, actionType) {
    return { type: "input", playerSubId: subId, action_name: actionName, action: actionType };
}

export default class Pong extends Component {
    async setupGameTerrain() {
        const terrainSkin = terrainSkins.get(this.terrainSkin);
        await terrainSkin.init(this.gltfLoader, this.exrLoader, this.scene, this.brittleHollowMaterial);

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

    async createBody(type, id, shape, position) {
        let body = undefined;

        if (type == "Ball") {
            const ballSkin = ballSkins.get(this.ballSkin);

            body = await ballSkin.init(this.gltfLoader, this.scene);

            // body = createSphere(position["x"], position["y"], 0.5, 32, 16, "#ffde21");
            // ! Add an If statement or find a proper way.
            // body = this.brittle.get("Ball");
        } else if (type == "Player") {
            // body = createCube(position["x"], position["y"], this.playerWidth, this.playerHeight, "#cd1c18");
            const playerSkin = barSkins.get(this.barSkin);

            body = await playerSkin.init(this.gltfLoader, this.exrLoader, this.scene, this.brittleHollowMaterial);

            if (id == "player2") {
                body.rotation.z *= -1;
            }
        } else {
            body = createCube(0, 0, 0, 0, 0, "#000000");
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

    async onUpdateReceived(data) {
        for (let body of data["bodies"]) {
            if (this.bodies.has(body["id"])) {
                let lbody = this.bodies.get(body["id"]);
                lbody.position.x = body["pos"]["x"];
                lbody.position.y = body["pos"]["z"];
                lbody.position.z = -body["pos"]["y"];

                if (DEBUG && this.boxes.has(body["id"])) {
                    let box = this.boxes.get(body["id"]);
                    box.object.position.x = body["pos"]["x"];
                    box.object.position.y = body["pos"]["z"];
                    box.object.position.z = -body["pos"]["y"];
                }
            } else {
                const lbody = await this.createBody(body["type"], body["id"], body["shape"], body["pos"]);
                if (lbody != undefined && !this.bodies.has(body["id"])) {
                    this.bodies.set(body["id"], lbody);
                    this.scene.add(lbody);
                } else if (lbody == undefined) {
                    console.error("cannot create body", body);
                }
            }
        }

        let score1 = data["scores"][0];
        let score2 = data["scores"][1];

        const score1t = document.getElementById("score1");
        const score2t = document.getElementById("score2");

        if (score1t && score2t) {
            document.getElementById("score1").textContent = score1;
            document.getElementById("score2").textContent = score2;
        }
    }

    async onMessage(data) {
        const id = params.get("id");

        if (data.type == "update" && id != null) {
            await this.onUpdateReceived(data);
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
        this.exrLoader = new EXRLoader();

        this.gameStarted = false;
        this.gameEnded = false;

        registerAllSkins();

        let brittleHollowTexture = await this.exrLoader.loadAsync("/models/BrittleHollow/4k.exr");
        brittleHollowTexture.mapping = THREE.EquirectangularReflectionMapping;

        this.brittleHollowMaterial = new THREE.ShaderMaterial({
            vertexShader: await loadShaderFile("/models/BrittleHollow/TerrainPieceVert.glsl"),
            fragmentShader: await loadShaderFile("/models/BrittleHollow/TerrainPieceFrag.glsl"),
            uniforms: {
                u_emissiveColor: { value: new THREE.Color("#d1718e") },
                u_emissiveIntensity: { value: 1.0 },
                u_opacity: { value: 1.0 },
                u_envMap: { value: brittleHollowTexture },
                t1: { value: 0.1 },
                t2: { value: 0.99 },
                crystalColor: { value: new THREE.Color("#FFA500") },
                u_time: { value: 1.0 },
                u_bFactor: { value: 2.0 },
                u_pcurveHandle: { value: 1.0 },
                u_scale: { value: 0.8 },
                u_roughness: { value: 1.0 },
                u_detail: { value: 1.0 },
                u_randomness: { value: 1.0 },
                u_lacunarity: { value: 1.0 },
            },
            side: THREE.DoubleSide,
        });

        this.info = await post("/api/player/c/profile", {}).then((res) => res.json());

        this.terrainSkin =
            this.info.skins["terrain"] == "brittle-hollow" ? this.info.skins["terrain"] : "colorful-terrain";
        this.ballSkin = this.info.skins["ball"] == "lava-ball" ? this.info.skins["ball"] : "colorful-ball";
        this.barSkin = this.info.skins["bar"] == "brittle-hollow" ? this.info.skins["bar"] : "colorful-bar";

        if (this.terrainSkin == "brittle-hollow") {
            this.scene.environment = brittleHollowTexture.clone();
            this.scene.background = brittleHollowTexture.clone();
        }

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
            camera.position.y = 15;

            const light = new THREE.DirectionalLight("white", 5.0);
            light.position.z = 20;
            light.position.y = 15;

            this.scene.add(light);

            if (!DEBUG) {
                controls.enableRotate = false;
                controls.enablePan = false;
                controls.enableZoom = false;
                controls.enableDamping = false;
            }

            this.ballComposer = new EffectComposer(renderer);
            this.ballRenderPass = new RenderPass(this.scene, camera);
            this.ballComposer.addPass(this.ballRenderPass);

            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(c.clientWidth, c.clientHeight),
                0.1, // strength
                0.4, // radius
                0.85 // threshold
            );
            this.ballComposer.addPass(this.bloomPass);

            // await this.setupGameTerrain();

            // ! Ensure It's applied only on Brittle Hollow map.
            // renderer.toneMapping = THREE.ReinhardToneMapping;
            // renderer.toneMappingExposure = 0.3;

            // const ballComposer = new EffectComposer(renderer);
            // const ballRenderPass = new RenderPass(this.scene, camera);
            // ballComposer.addPass(ballRenderPass);

            // const bloomPass = new UnrealBloomPass(new THREE.Vector2(c.clientWidth, c.clientHeight), 1.5, 0.4, 0.85);
            // ballComposer.addPass(bloomPass);

            // const particleSystem = this.brittle.get("ParticleSystem");

            // this.start = Date.now();
            // this.previousTime = performance.now();

            renderer.setAnimationLoop(() => {
                for (let [key, value] of this.boxes) {
                    value.update();
                }
                controls.update();

                // this.currentTime = performance.now();
                // this.timeElapsed = (this.currentTime - this.previousTime) / 1000;
                // this.previousTime = this.currentTime;
                // particleSystem.step(this.timeElapsed, this.basePosition);

                // this.fireCustomShaderMaterial.uniforms["time"].value = 0.00025 * (Date.now() - this.start);

                // renderer.render(this.scene, camera);
                this.ballComposer.render(this.scene, camera);
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

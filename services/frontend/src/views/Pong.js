import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { getOriginNoProtocol, post } from "../utils";
import { Component, params, navigateTo } from "../micro";
import { tr } from "../i18n";
import { ParticleSystem } from "../ParticleSystem";

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
        const wallTop = createCube(0, -12.4, 36, 0.4, 0.5, "white");
        const wallBottom = createCube(0, 12.4, 36, 0.4, 0.5, "white");

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
        return createSphere(0, 0, 0.5, 32, 16, "white");
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
                emissiveIntensity: { value: 5.0 },
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
        return createCube(0, 0, 1.0, 1.0, 5.0, "white");
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

            let gameover = /* HTML */ ` <div class="container-fluid end-game-text">
                <span>${winnerText}</span>
                <button id="home-btn" type="button" class="btn btn-primary settings">${tr("Back to home")}</button>
            </div>`;

            const endGameText = document.querySelector(".container-fluid.end-game");
            if (endGameText) {
                endGameText.innerHTML += gameover;
            }

            const homeBtn = document.getElementById("home-btn");

            if (homeBtn) {
                homeBtn.addEventListener("click", () => {
                    navigateTo("/");
                });
            }

            setTimeout(() => {
                navigateTo("/");
            }, 5000);
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

    async initQuantumShard(x, y, z) {
        const quantumShardVertexShader = await loadShaderFile("/models/BrittleHollow/QuantumShard/vertexShader.glsl");
        const quantumShardFragmentShader = await loadShaderFile(
            "/models/BrittleHollow/QuantumShard/fragmentShader.glsl"
        );

        const quantumShardHoleVertexShader = await loadShaderFile(
            "/models/BrittleHollow/QuantumShard/holeVertexShader.glsl"
        );
        const quantumShardHoleFragmentShader = await loadShaderFile(
            "/models/BrittleHollow/QuantumShard/holeFragmentShader.glsl"
        );

        const quantumShardShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: quantumShardVertexShader,
            fragmentShader: quantumShardFragmentShader,
            uniforms: {
                u_time: { value: 1.0 },
                u_bFactor: { value: 1.0 },
                u_pcurveHandle: { value: 5.0 },
                u_scale: { value: 5.0 },
                u_roughness: { value: 0.25 },
                u_detail: { value: 10.0 },
                u_randomness: { value: 1.0 },
                u_lacunarity: { value: 1.0 },
            },
            side: THREE.DoubleSide,
        });

        const emissiveFresnelMaterial = new THREE.ShaderMaterial({
            vertexShader: quantumShardHoleVertexShader,
            fragmentShader: quantumShardHoleFragmentShader,
            uniforms: {
                u_emissiveColor: { value: new THREE.Color(0x1a3d6b) },
                u_emissiveIntensity: { value: 5.0 },
                u_opacity: { value: 1.0 },
            },
            transparent: true,
        });

        return new Promise((resolve, reject) => {
            const quantumShardLoader = new GLTFLoader();
            quantumShardLoader.load(
                "/models/BrittleHollow/QuantumShard/QuantumShard.glb",
                (gltf) => {
                    const quantumShard = gltf.scene;

                    quantumShard.traverse((child) => {
                        if (child.isMesh) {
                            if (child.name === "Hole") {
                                child.material = emissiveFresnelMaterial;
                            } else {
                                child.material = quantumShardShaderMaterial;
                            }
                        }
                    });

                    quantumShard.position.set(x, y, z);
                    resolve(quantumShard);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    async initDeadTree(x, y, z) {
        const deadTreeVertexShader = await loadShaderFile("/models/BrittleHollow/DeadTree/vertexShader.glsl");
        const deadTreeFragmentShader = await loadShaderFile("/models/BrittleHollow/DeadTree/fragmentShader.glsl");

        const deadTreeCustomShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: deadTreeVertexShader,
            fragmentShader: deadTreeFragmentShader,
            uniforms: {
                u_time: { value: 1.0 },
                u_bFactor: { value: 1.0 },
                u_pcurveHandle: { value: 2.0 },
                u_scale: { value: 1.0 },
                u_roughness: { value: 1.0 },
                u_detail: { value: 1.0 },
                u_randomness: { value: 1.0 },
                u_lacunarity: { value: 1.0 },
            },
            side: THREE.DoubleSide,
        });

        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                "/models/BrittleHollow/DeadTree/DeadTree.glb",
                (gltf) => {
                    const tree = gltf.scene.clone();
                    tree.traverse((child) => {
                        if (child.isMesh) {
                            child.material = deadTreeCustomShaderMaterial;
                        }
                    });

                    tree.position.set(x, y, z);
                    tree.rotation.set(0, THREE.MathUtils.randInt(-360, 360), 0);
                    tree.scale.set(0.5, 0.5, 0.5);
                    resolve(tree);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    async initCampfire(x, y, z) {
        const rockVertexShader = await loadShaderFile("/models/BrittleHollow/Campfire/rockVertexShader.glsl");
        const rockFragmentShader = await loadShaderFile("/models/BrittleHollow/Campfire/rockFragmentShader.glsl");

        const rockCustomShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: rockVertexShader,
            fragmentShader: rockFragmentShader,
            side: THREE.DoubleSide,
        });

        const woodVertexShader = await loadShaderFile("/models/BrittleHollow/Campfire/woodVertexShader.glsl");
        const woodFragmentShader = await loadShaderFile("/models/BrittleHollow/Campfire/woodFragmentShader.glsl");

        const woodCustomShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: woodVertexShader,
            fragmentShader: woodFragmentShader,
            side: THREE.DoubleSide,
        });

        return new Promise((resolve, reject) => {
            const campfireLoader = new GLTFLoader();
            campfireLoader.load(
                "/models/BrittleHollow/Campfire/Campfire.glb",
                (gltf) => {
                    const campfire = gltf.scene.clone();
                    campfire.traverse((child) => {
                        if (child.isMesh) {
                            if (child.name === "Rock") {
                                child.material = rockCustomShaderMaterial;
                            } else {
                                child.material = woodCustomShaderMaterial;
                            }
                        }
                    });

                    campfire.position.set(x, y, z);
                    campfire.rotation.set(0, THREE.MathUtils.randInt(-360, 360), 0);
                    campfire.scale.set(3, 3, 3);
                    resolve(campfire);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    async initParticle(scene, texture, smokeColor, blendingMode) {
        const particleVertexShader = await loadShaderFile("/models/BrittleHollow/Particle/vertexShader.glsl");
        const particleFragmentShader = await loadShaderFile("/models/BrittleHollow/Particle/fragmentShader.glsl");

        this.basePosition = new THREE.Vector3(0, 0, 0);

        const particleSystem = new ParticleSystem({
            parent: scene,
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            texture: texture,
            uniforms: {
                smokeColor: { value: smokeColor },
            },
            blendingMode: blendingMode,
        });

        return particleSystem;
    }

    async initFireShader() {
        const textureLoader = new THREE.TextureLoader();

        const meteoriteVertexShader = await loadShaderFile("/models/BrittleHollow/Meteorite/vertexShader.glsl");
        const meteoriteFragmentShader = await loadShaderFile("/models/BrittleHollow/Meteorite/fragmentShader.glsl");

        const explosionTexture = textureLoader.load("/models/BrittleHollow/Meteorite/Explosion.png");

        return new THREE.ShaderMaterial({
            vertexShader: meteoriteVertexShader,
            fragmentShader: meteoriteFragmentShader,
            uniforms: {
                tExplosion: {
                    type: "t",
                    value: explosionTexture,
                },
                time: {
                    type: "f",
                    value: 0.0,
                },
            },
        });
    }

    async initMeteorite(x, y, z) {
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(20, 4), this.fireShader);

        mesh.position.set(x, y, z);
        mesh.scale.set(0.1, 0.1, 0.1);
        return mesh;
    }

    async generateMeteorite(meteorites) {
        const x = this.randInt(-42, 42);
        const y = this.randInt(-42, 42);
        const z = this.randInt(-42, 0);

        const direction = new THREE.Vector3(
            (Math.random() * 0.2 - 0.1) * (Math.random() < 0.5 ? 1 : -1),
            (Math.random() * 0.2 - 0.1) * (Math.random() < 0.5 ? 1 : -1),
            (Math.random() * 0.2 - 0.1) * (Math.random() < 0.5 ? 1 : -1)
        );

        const meteorite = await this.initMeteorite(x, y, z, this.fireShader);
        this.scene.add(meteorite);

        const smokeColor = new THREE.Vector4(0.43 * 0.1, 0.15 * 0.1, 0.05 * 0.1, 1.0);
        const blendingMode = THREE.NormalBlending;

        const particleSystem = await this.initParticle(
            this.scene,
            "/models/BrittleHollow/Particle/Smoke.png",
            smokeColor,
            blendingMode
        );

        const amplitude = this.randInt(0.5, 5);

        meteorites.push({
            mesh: meteorite,
            startTime: Date.now(),
            direction: direction,
            amplitude: amplitude,
            frequency: 1,
            particleSystem: particleSystem,
        });
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

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

            // Init one Shard at each side.
            let randZ = this.randInt(-10, 10);
            this.quantumShard = await this.initQuantumShard(-25, 0, randZ);
            this.scene.add(this.quantumShard);

            this.quantumShardTwo = this.quantumShard.clone();
            randZ = this.randInt(-10, 10);
            this.quantumShardTwo.position.set(25, 0, randZ);
            this.scene.add(this.quantumShardTwo);

            // Init 6 deadTrees at each side.
            for (let i = 0; i < 12; i++) {
                randZ = this.randInt(-15, 15);
                let randX = this.randInt(-19, -18);

                let x = 1;
                if (i % 2 === 0) {
                    x *= -1;
                }
                const deadTree = await this.initDeadTree(randX * x, 0, randZ * x);

                this.scene.add(deadTree);

                this.meteorites = [];
            }

            // Init 2 campfire and their particle at each side.
            const fireColor = new THREE.Vector4(1.0, 0.5, 0.0, 1.0);

            randZ = this.randInt(-10, 10);
            this.campfire = await this.initCampfire(-20, 1, randZ);
            this.scene.add(this.campfire);

            this.campfireParticle = await this.initParticle(
                this.scene,
                "/models/BrittleHollow/Particle/Fire.jpg",
                fireColor
            );

            this.campfireParticleTwo = await this.initParticle(
                this.scene,
                "/models/BrittleHollow/Particle/Fire.jpg",
                fireColor
            );

            this.campfireTwo = this.campfire.clone();
            randZ = this.randInt(-10, 10);
            this.campfireTwo.position.set(20, 1, randZ);
            this.scene.add(this.campfireTwo);

            this.fireShader = await this.initFireShader();
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

            if (this.terrainSkin == "brittle-hollow") {
                this.start = Date.now();
                this.previousTime = performance.now();

                setInterval(() => {
                    this.generateMeteorite(this.meteorites);
                }, 4200);
            }

            renderer.setAnimationLoop(() => {
                for (let [key, value] of this.boxes) {
                    value.update();
                }
                controls.update();

                if (this.terrainSkin == "brittle-hollow") {
                    this.quantumShard.rotation.y += 0.01;
                    this.quantumShardTwo.rotation.y += 0.01;

                    this.fireShader.uniforms["time"].value = 0.00025 * (Date.now() - this.start);

                    this.currentTime = performance.now();
                    this.timeElapsed = (this.currentTime - this.previousTime) / 1000;
                    this.previousTime = this.currentTime;

                    this.campfireParticle.step(this.timeElapsed, this.campfire.position, new THREE.Vector3(0, 1.0, 0));
                    this.campfireParticleTwo.step(
                        this.timeElapsed,
                        this.campfireTwo.position,
                        new THREE.Vector3(0, 1.0, 0)
                    );

                    this.meteorites.forEach((meteorite, index) => {
                        meteorite.mesh.position.add(meteorite.direction.clone().multiplyScalar(0.5));

                        meteorite.mesh.position.y =
                            meteorite.amplitude *
                            Math.sin(meteorite.frequency * (Date.now() - meteorite.startTime) * 0.001);

                        meteorite.particleSystem.step(this.timeElapsed, meteorite.mesh.position, meteorite.direction);

                        if (Date.now() - meteorite.startTime > 21000) {
                            this.scene.remove(meteorite.mesh);
                            this.scene.remove(meteorite.particleSystem.points);
                            this.meteorites.splice(index, 1);
                        }
                    });
                }

                this.ballComposer.render(this.scene, camera);
            });

            this.ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/pong/${id}`);
            this.ws.onopen = async (event) => {
                await this.setupGameTerrain();
            };
            this.ws.onerror = (event) => {
                navigateTo("/404");
            };
            this.ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                await this.onMessage(data);

                this.ws.send("{ 'type': 'pong' }");
            };
        };
    }

    render() {
        let ui = /* HTML */ `
            <div class="container-fluid tournament-match-container pong">
                <div class="player-info game">
                    <span class="player-score" id="score1">0</span>
                </div>
                <div class="glitch-wrapper vs">
                    <div class="glitch vs" data-glitch="VS">VS</div>
                </div>
                <div class="player-info game">
                    <span class="player-score" id="score2">0</span>
                </div>
            </div>
            <div class="container-fluid end-game"></div>
        `;

        return /* HTML */ ` <HomeNavBar />
            <div id="pong">${ui}</div>`;
    }
}

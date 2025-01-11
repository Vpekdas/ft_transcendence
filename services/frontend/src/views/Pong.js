import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { getOriginNoProtocol, post } from "../utils";

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
    terrainSkins.set("brittle-hollow", new TerrainSkin("brittle-hollow", "/models/BrittleHollow.glb"));

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

/** @type {import("../micro").Component} */
export default async function Pong({ dom, params }) {
    const id = params.get("id");

    /** @type {THREE.Scene} */
    let scene = new THREE.Scene();
    /** @type {WebSocket} */
    let ws;

    let bodies = new Map();
    let boxes = new Map();

    const playerWidth = 1.0;
    const playerHeight = 5.0;

    const textureLoader = new THREE.TextureLoader();
    const fontLoader = new FontLoader();
    const modelLoader = new GLTFLoader();

    const font = await fontLoader.loadAsync("/fonts/TakaoMincho_Regular.json");
    let textMesh = new THREE.Mesh(undefined);

    registerAllSkins();

    let skin = terrainSkins.get("brittle-hollow");

    const terrain = await modelLoader.loadAsync(skin.model);

    const lava = await modelLoader.loadAsync("/models/Lava.glb");

    scene.add(lava.scene);

    textMesh.scale.set(0.01, 0.01, 0.01);
    scene.add(textMesh);

    async function setupGameTerrain() {
        const terrainSceneRight = terrain.scene;
        terrainSceneRight.rotation.set(Math.PI / 2, 0, 0);
        terrainSceneRight.position.set(13, 0, -1);
        scene.add(terrainSceneRight);

        const terrainSceneLeft = terrain.scene.clone();
        terrainSceneLeft.rotation.set(Math.PI / 2, 0, Math.PI);
        terrainSceneLeft.position.set(-13, 0, -1);
        scene.add(terrainSceneLeft);

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
    }

    function createBody(type, id, shape, position) {
        let body = undefined;

        if (type == "Ball") {
            body = createSphere(position["x"], position["y"], 0.5, 32, 16, "#ffde21");
        } else if (type == "Player") {
            body = createCube(position["x"], position["y"], playerWidth, playerHeight, "#cd1c18");
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

        let score1 = data["scores"][0];
        let score2 = data["scores"][1];

        const geometry = new TextGeometry(score1 + " - " + score2, {
            font: font,
            size: 80,
            depth: 0,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5,
        });

        var oldGeometry = textMesh.geometry;
        textMesh.geometry = geometry;
        oldGeometry.dispose();
    }

    async function onMessage(data) {
        if (data.type == "update" && id != null) {
            onUpdateReceived(data);
        } else if (data.type == "winner" && !gameEnded) {
            gameEnded = true;

            let geometry;

            if (data.winner == playerInfo.id) {
                geometry = new TextGeometry("You win !", {
                    font: font,
                    size: 80,
                    depth: 0,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 10,
                    bevelSize: 8,
                    bevelOffset: 0,
                    bevelSegments: 5,
                });
            } else {
                geometry = new TextGeometry("You loose :(", {
                    font: font,
                    size: 80,
                    depth: 0,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 10,
                    bevelSize: 8,
                    bevelOffset: 0,
                    bevelSegments: 5,
                });
            }
            const mesh = new THREE.Mesh(geometry);
            scene.add(mesh);
        } else if (data["type"] == "redirectTournament") {
            navigateTo(`/tournament/${data["id"]}`);
        }
    }

    dom.querySelector("#pong").do(async (c) => {
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
        camera.position.y = -2;

        if (!DEBUG) {
            controls.enableRotate = false;
            controls.enablePan = false;
            controls.enableZoom = false;
            controls.enableDamping = false;
        }

        renderer.setAnimationLoop(() => {
            for (let [key, value] of boxes) {
                value.update();
            }
            controls.update();
            renderer.render(scene, camera);
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
                scene.add(star);
            });

        const spaceTexture = textureLoader.load("/img/space.jpg");
        scene.background = spaceTexture;

        // ! For ground, It seems ok but may not be ok for other models.
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 20);
        scene.add(directionalLight);

        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(directionalLightHelper);

        ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/pong/${id}`);
        ws.onopen = async (event) => {
            await setupGameTerrain();
        };
        // ws.onerror = (event) => {
        //     showToast(tr("Cannot connect to the game"), "bi bi-exclamation-triangle-fill");S
        // };
        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            await onMessage(data);
        };
    });

    return /* HTML */ ` <NavBar />
        <div id="pong"></div>`;
}

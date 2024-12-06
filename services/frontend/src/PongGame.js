import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { action } from "./game";

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
    sphere.scale.set(1.0, 1.0, 1.0);
    return sphere;
}

function debuggingBox2(scene, position, width, height) {
    const box = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(width, height, 1)), 0xffff00);
    box.object.position.x = position["x"];
    box.object.position.y = position["y"];
    box.object.position.z = position["z"];
    return box;
}

const DEBUG = true;

export class PongGame {
    constructor() {}

    async setup(cc, c) {
        const id = cc.attrib("id");

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(c.clientWidth, c.clientHeight);

        window.addEventListener("resize", onWindowResize, false);

        function onWindowResize() {
            renderer.setSize(c.clientWidth, c.clientHeight);
            camera.aspect = c.clientWidth / c.clientHeight;
            camera.updateProjectionMatrix();
        }

        const loader = new FontLoader();

        this.font = await loader.loadAsync("fonts/TakaoMincho_Regular.json");
        this.textMesh = new THREE.Mesh(undefined);
        this.textMesh.scale.set(0.01, 0.01, 0.01);
        this.scene.add(this.textMesh);

        /** @type Map<string, any> */
        this.bodies = new Map();
        this.boxes = new Map();

        this.playerWidth = 1.0;
        this.playerHeight = 5.0;

        c.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, c);

        this.camera.position.z = 20;
        this.camera.position.y = -2;
        this.renderer.setAnimationLoop(() => {
            for (let [key, value] of this.boxes) {
                value.update();
            }
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
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

        const spaceTexture = new THREE.TextureLoader().load("/img/space.jpg");
        this.scene.background = spaceTexture;

        this.ws = new WebSocket(`ws://localhost:8000/ws`);
        this.ws.onopen = (event) => {
            if (id == undefined) {
                this.ws.send(JSON.stringify({ type: "matchmake", gamemode: "1v1" }));
            } else {
                this.ws.send(JSON.stringify({ type: "join", gamemode: "1v1" }));
            }
        };
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            await this.onMessage(data);
        };
    }

    async setupGameTerrain() {
        // Place both terrains
        const modelLoader = new GLTFLoader();
        const terrain = await modelLoader.loadAsync("/models/TerrainPlaceholder.glb");

        const terrainSceneRight = terrain.scene;
        terrainSceneRight.rotation.set(Math.PI / 2, 0, 0);
        terrainSceneRight.position.set(13, 0, -1);
        this.scene.add(terrainSceneRight);

        const terrainSceneLeft = terrain.scene.clone();
        terrainSceneLeft.rotation.set(Math.PI / 2, 0, Math.PI);
        terrainSceneLeft.position.set(-13, 0, -1);
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
            body = addSphere(this.scene, position["x"], position["y"], 0.5, 32, 16, "#ffde21");
        } else if (type == "Player") {
            body = addCube(this.scene, position["x"], position["y"], this.playerWidth, this.playerHeight, "#cd1c18");
        } else {
            body = addCube(this.scene, 0, 0, 0, 0, "#000000");
        }

        if (DEBUG) {
            let box;
            if (shape["type"] == "Box") {
                box = debuggingBox2(
                    this.scene,
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

        // const geometry = new TextGeometry(score1 + " - " + score2, {
        //     font: this.font,
        //     size: 80,
        //     depth: 0,
        //     curveSegments: 12,
        //     bevelEnabled: true,
        //     bevelThickness: 10,
        //     bevelSize: 8,
        //     bevelOffset: 0,
        //     bevelSegments: 5,
        // });

        // this.textMesh.geometry = geometry;
    }

    async onMessage(data) {
        if (data.type == "update") {
            this.onUpdateReceived(data);
        } else if (data.type == "matchFound") {
            await this.setupGameTerrain();
            location.location.pathname = "/play/" + data.id;
        } else if (data.type == "waiting") {
            console.log("Waiting for");
        }
    }
}

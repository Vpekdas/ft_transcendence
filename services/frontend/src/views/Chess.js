import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Component } from "../micro";

const validPositions = [
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",

    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    "B8",

    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
    "C6",
    "C7",
    "C8",

    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
    "D6",
    "D7",
    "D8",

    "E1",
    "E2",
    "E3",
    "E4",
    "E5",
    "E6",
    "E7",
    "E8",

    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",

    "G1",
    "G2",
    "G3",
    "G4",
    "G5",
    "G6",
    "G7",
    "G8",

    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "H7",
    "H8",
];

export default class Chess extends Component {
    convertPos(pos) {
        /** @type {number} */
        const letter = pos.toUpperCase().charCodeAt(0);
        /** @type {number} */
        const num = parseInt(pos[1]);

        const tileSize = 3.95;

        // -2.0 + -4.0 * 3

        const c = (x) => -tileSize / 2 + -tileSize * 3 + tileSize * x;

        let x = c(letter - "A".charCodeAt(0));
        let y = 0;
        let z = c(8 - num);

        return { x: x, y: y, z: z };
    }

    convertPosToIndex(pos) {
        /** @type {number} */
        const letter = pos.toUpperCase().charCodeAt(0);
        /** @type {number} */
        const num = parseInt(pos[1]);

        let x = letter - "A".charCodeAt(0);
        let y = 8 - num;

        return x + y * 8;
    }

    placePiece(type, pos, color) {
        const model = this.models.get(type).clone(true);

        model.name = "Piece-" + type + "-" + color;
        model.userData = {
            type: type,
            owned: color == "white",
            pos: pos,
            offsetX: model.position.x,
            offsetY: model.position.y,
            offsetZ: model.position.z,
        };

        const coords = this.convertPos(pos);
        model.position.x = model.userData.offsetX + coords.x;
        model.position.y = model.userData.offsetY + coords.y;
        model.position.z = model.userData.offsetZ + coords.z;

        model.traverse((obj) => {
            if (obj.isMesh) {
                /** @type {THREE.Mesh} */
                obj.material = new THREE.MeshPhongMaterial({ color: color });
            }
        });

        this.scene.add(model);

        this.board[this.convertPosToIndex(pos)] = model;
    }

    placeBoard() {
        // white pieces
        this.placePiece("pawn", "A2", "white");
        this.placePiece("pawn", "B2", "white");
        this.placePiece("pawn", "C2", "white");
        this.placePiece("pawn", "D2", "white");
        this.placePiece("pawn", "E2", "white");
        this.placePiece("pawn", "F2", "white");
        this.placePiece("pawn", "G2", "white");
        this.placePiece("pawn", "H2", "white");

        this.placePiece("rook", "A1", "white");
        this.placePiece("knight", "B1", "white");
        this.placePiece("bishop", "C1", "white");
        this.placePiece("king", "D1", "white");
        this.placePiece("queen", "E1", "white");
        this.placePiece("bishop", "F1", "white");
        this.placePiece("knight", "G1", "white");
        this.placePiece("rook", "H1", "white");

        // black pieces
        this.placePiece("pawn", "A7", "black");
        this.placePiece("pawn", "B7", "black");
        this.placePiece("pawn", "C7", "black");
        this.placePiece("pawn", "D7", "black");
        this.placePiece("pawn", "E7", "black");
        this.placePiece("pawn", "F7", "black");
        this.placePiece("pawn", "G7", "black");
        this.placePiece("pawn", "H7", "black");

        this.placePiece("rook", "A8", "black");
        this.placePiece("knight", "B8", "black");
        this.placePiece("bishop", "C8", "black");
        this.placePiece("king", "D8", "black");
        this.placePiece("queen", "E8", "black");
        this.placePiece("bishop", "F8", "black");
        this.placePiece("knight", "G8", "black");
        this.placePiece("rook", "H8", "black");

        // Place debug boxes to each tiles
        for (let pos of validPositions) {
            const box = this.debuggingBox(this.convertPos(pos), 3.95, 0.5, 3.95);

            box.name = "Tile-" + pos;
            box.object.position.y = -3.4;

            box.userData = { pos: pos };

            this.scene.add(box);
            this.boxes.push(box);
        }
    }

    moveTo(piece, pos) {
        const coords = this.convertPos(pos);
        piece.position.x = piece.userData.offsetX + coords.x;
        piece.position.y = piece.userData.offsetY + coords.y;
        piece.position.z = piece.userData.offsetZ + coords.z;
    }

    async loadModelWithParams(path, scale, pos, rot) {
        const model = await this.fbxLoader.loadAsync(path);
        model.scale.set(scale, scale, scale);
        model.position.set(0, pos.y, pos.z);

        if (rot) {
            model.rotation.set(rot.x ? rot.x : 0, rot.y ? rot.y : 0, rot.z ? rot.z : 0);
        }

        return model;
    }

    debuggingBox(position, width, height, depth) {
        const box = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth)), 0xffff00);
        box.object.position.x = position.x;
        box.object.position.y = position.y;
        box.object.position.z = position.z;
        return box;
    }

    async init() {
        this.scene = new THREE.Scene();

        this.fbxLoader = new FBXLoader();

        this.boxes = [];
        /** @type {Map<string, THREE.Object3D>} */
        this.models = new Map();

        this.models.set("pawn", await this.loadModelWithParams("/models/chess/PawnMesh.fbx", 0.01, { y: -2.2, z: 0 }));
        this.models.set(
            "rook",
            await this.loadModelWithParams("/models/chess/RookMesh.fbx", 0.02, { y: 0.0, z: -5.45 })
        );

        this.models.set(
            "knight",
            await this.loadModelWithParams(
                "/models/chess/KnightMesh.fbx",
                0.012,
                { y: -1.4, z: 0 },
                { x: Math.PI / 2, y: 0, z: Math.PI / 2 }
            )
        );
        this.models.set(
            "bishop",
            await this.loadModelWithParams(
                "/models/chess/BishopMesh.fbx",
                0.012,
                { y: -1.0, z: 0 },
                { x: Math.PI / 2, y: 0, z: Math.PI / 2 }
            )
        );
        this.models.set(
            "king",
            await this.loadModelWithParams("/models/chess/KingMesh.fbx", 0.015, { y: -0.5, z: 0 }, { y: Math.PI / 2 })
        );
        this.models.set(
            "queen",
            await this.loadModelWithParams(
                "/models/chess/QueenMesh.fbx",
                0.015,
                { y: -1.0, z: 0 },
                { x: Math.PI / 2, y: 0, z: Math.PI / 2 }
            )
        );

        this.raycaster = new THREE.Raycaster();

        /** @type {Array<THREE.Object3D>} */
        this.board = new Array(8 * 8);

        /**
         * The piece currently being moved if any.
         * @type {THREE.Object3D}
         */
        this.pieceInMove = null;

        this.onready = async () => {
            const c = document.getElementById("chess");

            let camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
            let renderer = new THREE.WebGLRenderer();

            renderer.setSize(c.clientWidth, c.clientHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;

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

            c.addEventListener("click", (event) => {
                const x = (event.clientX / window.innerWidth) * 2 - 1;
                const y = -(event.clientY / window.innerHeight) * 2 + 1;

                this.raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
                const objects = this.raycaster.intersectObjects(this.scene.children);

                const tile = objects.find((value) => value.object.name.startsWith("Tile-"));
                const pieceMesh = objects.find((value) => value.object.parent.name.startsWith("Piece-"));

                let pos = undefined;

                if (pieceMesh) {
                    pos = pieceMesh.object.parent.userData.pos;
                } else if (tile) {
                    pos = tile.object.userData.pos;
                }

                console.log(objects);
                console.log(pos);

                if (pos) {
                    const index = this.convertPosToIndex(pos);
                    const pieceAtPos = this.board[index];

                    if (this.pieceInMove == null) {
                        if (pieceAtPos != null && pieceAtPos.userData.owned) {
                            this.pieceInMove = pieceAtPos;
                        }
                    } else {
                        // TODO: Check if the move is valid, ...

                        if (pieceAtPos == null) {
                            const piece = this.pieceInMove;

                            this.board[this.convertPosToIndex(this.pieceInMove.userData.pos)] = undefined;
                            this.board[index] = piece;

                            this.pieceInMove = null;

                            piece.userData.pos = pos;
                            this.moveTo(piece, pos);
                        } else if (pieceAtPos != null && pieceAtPos.userData.owned) {
                            this.pieceInMove = pieceAtPos;
                        }
                    }
                } else {
                    console.log("outside the board");
                }
            });

            renderer.setClearColor("blue");

            const controls = new OrbitControls(camera, c);

            camera.position.z = 25;
            camera.position.y = 20;

            const ambientLight = new THREE.AmbientLight(0xffffff, 1);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(0, 20, 0);
            this.scene.add(directionalLight);

            // Add the board
            const board = await this.fbxLoader.loadAsync("/models/chess/Chess Board.fbx");
            board.position.set(0, -4.75, 0);
            board.receiveShadow = true;
            this.scene.add(board);

            this.placeBoard();

            renderer.setAnimationLoop(() => {
                for (let box of this.boxes) {
                    box.update();
                }

                controls.update();
                renderer.render(this.scene, camera);
            });
        };
    }

    render() {
        return /* HTML */ `<HomeNavBar />
            <div id="chess"></div>`;
    }
}

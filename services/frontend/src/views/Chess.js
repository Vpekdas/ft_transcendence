import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Component } from "../micro";
import { getOriginNoProtocol } from "../utils";

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

const tileSize = 3.95;

class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static from(x, y) {
        return new Coords(x, y);
    }

    static fromShorthand(pos) {
        /** @type {number} */
        const letter = pos.toUpperCase().charCodeAt(0);
        /** @type {number} */
        const num = parseInt(pos[1]);

        return new Coords(letter - "A".charCodeAt(0), num - 1);
    }

    static fromWorldPos(pos) {
        const c = (x) => Math.floor(x / tileSize) + 4;
        const x = 7 - c(pos.x);
        const y = c(pos.z);

        if (x < 0 || x > 7 || y < 0 || y > 7) {
            return null;
        }

        return new Coords(x, y);
    }

    toWorldPos() {
        const c = (x) => -tileSize / 2 + -tileSize * 3 + tileSize * x;
        return { x: c(7 - this.x), y: 0, z: c(this.y) };
    }

    toIndex() {
        return this.x + this.y * 8;
    }

    toShorthand() {
        return String.fromCharCode(this.x + "A".charCodeAt(0)) + (this.y + 1);
    }

    isValid() {
        return this.x >= 0 && this.x <= 7 && this.y >= 0 && this.y <= 7;
    }
}

export default class Chess extends Component {
    /**
     * @param {string} type
     * @param {string} pos
     * @param {string} color
     */
    placePiece(type, pos, color) {
        const model = this.models.get(type).clone(true);
        const coords = Coords.fromShorthand(pos);

        model.name = "Piece-" + type + "-" + color;
        model.userData = {
            type: type,
            owned: color == "white",
            color: color,
            pos: coords,
            offsetX: model.position.x,
            offsetY: model.position.y,
            offsetZ: model.position.z,
            hasMoved: false,
        };

        const worldPos = coords.toWorldPos();
        model.position.x = model.userData.offsetX + worldPos.x;
        model.position.y = model.userData.offsetY + worldPos.y;
        model.position.z = model.userData.offsetZ + worldPos.z;

        model.traverse((obj) => {
            if (obj.isMesh) {
                /** @type {THREE.Mesh} */
                obj.material = new THREE.MeshPhongMaterial({ color: color });
            }
        });

        this.scene.add(model);
        this.board[coords.toIndex()] = model;
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
    }

    /**
     * @param {THREE.Object3D} piece
     * @param {Coords} coords
     */
    moveTo(piece, coords) {
        const worldPos = coords.toWorldPos();
        piece.position.x = piece.userData.offsetX + worldPos.x;
        piece.position.y = piece.userData.offsetY + worldPos.y;
        piece.position.z = piece.userData.offsetZ + worldPos.z;
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

    canMove(piece, pos) {
        return this.getAvailableMoves(piece).includes(pos.toShorthand());
    }

    getAvailableMoves(piece) {
        const type = piece.userData.type;
        const color = piece.userData.color;
        const hasMoved = piece.userData.hasMoved;
        const coords = piece.userData.pos;

        let moves = [];

        if (type == "pawn") {
            let sign;

            if (color == "white") {
                sign = 1;
            } else if (color == "black") {
                sign = -1;
            }

            if (
                Coords.from(coords.x, coords.y - sign * 1).isValid() &&
                this.get(coords.x, coords.y + sign * 1) == undefined
            ) {
                moves.push(Coords.from(coords.x, coords.y + sign * 1).toShorthand());
            }

            if (
                !hasMoved &&
                Coords.from(coords.x, coords.y - sign * 1).isValid() &&
                Coords.from(coords.x, coords.y - sign * 2).isValid() &&
                this.get(coords.x, coords.y + sign * 1) == undefined &&
                this.get(coords.x, coords.y + sign * 2) == undefined
            ) {
                moves.push(Coords.from(coords.x, coords.y + sign * 2).toShorthand());
            }

            if (
                Coords.from(coords.x - 1, coords.y + sign * 1).isValid() &&
                this.get(coords.x + 1, coords.y + sign * 1) != undefined &&
                !this.get(coords.x + 1, coords.y + sign * 1).userData.owned &&
                this.get(coords.x + 1, coords.y + sign * 1).userData.type != "king"
            ) {
                moves.push(Coords.from(coords.x + 1, coords + sign * 1).toShorthand());
            }

            if (
                Coords.from(coords.x - 1, coords.y - sign * 1).isValid() &&
                this.get(coords.x - 1, coords.y - sign * 1) != undefined &&
                !this.get(coords.x - 1, coords.y - sign * 1).userData.owned &&
                this.get(coords.x + 1, coords.y - sign * 1).userData.type != "king"
            ) {
                moves.push(Coords.from(coords.x + 1, coords + sign * 1).toShorthand());
            }
        } else if (type == "knight") {
            const possibleMoves = [
                [-1, -2], // 1
                [1, -2], // 2
                [-1, 2], // 3
                [1, 2], // 4
                [-2, -1], // 5
                [-2, 1], // 6
                [2, -1], // 7
                [2, 1], // 8
            ];

            for (let move of possibleMoves) {
                const moveCoords = Coords.from(coords.x + move[0], coords.y + move[1]);

                if (
                    moveCoords.isValid() &&
                    (this.get(moveCoords.x, moveCoords.y) == undefined ||
                        (this.get(moveCoords.x, moveCoords.y) != undefined &&
                            !this.get(moveCoords.x, moveCoords.y).userData.owned &&
                            this.get(moveCoords.x, moveCoords.y).userData.type != "king"))
                ) {
                    moves.push(moveCoords.toShorthand());
                }
            }
        }

        console.log(moves);

        return moves;
    }

    get(x, y) {
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            return undefined;
        }
        return this.board[x + y * 8];
    }

    /**
     * Move a piece.
     *
     * @param {THREE.Object3D} piece
     * @param {string} pos
     */
    move(piece, pos) {
        this.ws.send(JSON.stringify({ type: "move", from: piece.userData.pos.toShorthand(), to: pos }));
    }

    async init() {
        this.scene = new THREE.Scene();

        this.fbxLoader = new FBXLoader();

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

        this.ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/chess/1`);

        this.ws.onopen = () => {};

        this.ws.onmessage = () => {};

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

                const piece = objects.find((value) => value.object.parent.name.startsWith("Piece"));
                const chessBoard = objects.find((value) => value.object.name == "Chess_Board");

                // console.log(objects);

                /** @type {Coords} */
                let coords = undefined;

                if (piece && piece != this.pieceInMove) {
                    coords = piece.object.parent.userData.pos;
                    console.log(coords);
                } else if (chessBoard) {
                    coords = Coords.fromWorldPos({ x: chessBoard.point.x, z: chessBoard.point.z });
                    console.log(coords);
                }

                // console.log(objects);
                // console.log(pos);

                if (coords) {
                    const index = coords.toIndex();
                    const pieceAtPos = this.board[index];

                    if (this.pieceInMove == null) {
                        if (pieceAtPos != null && pieceAtPos.userData.owned) {
                            this.pieceInMove = pieceAtPos;
                            console.log("moving piece", pieceAtPos.name);
                        }
                    } else {
                        // TODO: Check if the move is valid, ...

                        if (pieceAtPos == null && this.canMove(this.pieceInMove, coords)) {
                            const piece = this.pieceInMove;

                            this.board[this.pieceInMove.userData.pos.toIndex()] = undefined;
                            this.board[index] = piece;

                            this.pieceInMove = null;

                            this.move(piece, coords.toShorthand());

                            piece.userData.pos = coords;
                            piece.userData.hasMoved = true;
                            this.moveTo(piece, coords);
                        } else if (pieceAtPos != null && !pieceAtPos.userData.owned) {
                            const piece = this.pieceInMove;
                            const opponentPiece = pieceAtPos;

                            this.board[this.pieceInMove.userData.pos.toIndex()] = undefined;
                            this.board[index] = piece;

                            this.pieceInMove = null;

                            this.move(piece, coords);

                            piece.userData.pos = coords;
                            piece.userData.hasMoved = true;
                            this.moveTo(piece, coords);

                            this.scene.remove(opponentPiece);
                        } else if (pieceAtPos != null && pieceAtPos.userData.owned) {
                            this.pieceInMove = pieceAtPos;
                            console.log("moving piece", pieceAtPos.name);
                        }
                    }
                }
            });

            c.addEventListener("pointermove", (event) => {
                const x = (event.clientX / window.innerWidth) * 2 - 1;
                const y = -(event.clientY / window.innerHeight) * 2 + 1;

                this.raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
                const objects = this.raycaster.intersectObjects(this.scene.children);

                const piece = objects.find((value) => value.object.parent.name.startsWith("Piece"));
                const chessBoard = objects.find((value) => value.object.name == "Chess_Board");

                if (this.box == null) {
                    return;
                }

                /** @type {Coords} */
                let coords = undefined;

                if (piece && piece != this.pieceInMove) {
                    coords = piece.object.parent.userData.pos;
                } else if (chessBoard) {
                    coords = Coords.fromWorldPos({ x: chessBoard.point.x, z: chessBoard.point.z });
                }

                if (coords) {
                    const worldPos = coords.toWorldPos();
                    this.box.object.position.x = worldPos.x;
                    this.box.object.position.z = worldPos.z;
                    this.box.visible = true;
                } else {
                    this.box.visible = false;
                }
            });

            renderer.setClearColor("blue");

            const controls = new OrbitControls(camera, c);

            camera.position.z = -25;
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

            // Place a box which will be use to highlight the current tile
            {
                this.box = this.debuggingBox(Coords.fromShorthand("D4").toWorldPos(), 3.95, 6.0, 3.95);
                this.box.object.position.y = -0.595;
                this.box.visible = false;
                this.scene.add(this.box);
            }

            renderer.setAnimationLoop(() => {
                this.box.update();

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

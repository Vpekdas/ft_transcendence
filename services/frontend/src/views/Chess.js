import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { Component } from "../micro";
import { getOriginNoProtocol } from "../utils";

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
            availableMoves: [],
        };

        const worldPos = coords.toWorldPos();
        model.position.x = model.userData.offsetX + worldPos.x;
        model.position.y = model.userData.offsetY + worldPos.y;
        model.position.z = model.userData.offsetZ + worldPos.z;

        model.traverse((obj) => {
            if (obj.isMesh) {
                /** @type {THREE.Mesh} */
                // obj.material = new THREE.MeshPhongMaterial({ color: color });
                obj.material = new THREE.MeshToonMaterial({ color: color });
            }
        });

        this.scene.add(model);
        this.board[coords.toIndex()] = model;
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
        return piece.userData.availableMoves.includes(pos.toShorthand());
    }

    allowedToMove(piece) {
        return (
            (this.gamemode == "local" && piece.userData.color == this.turn) ||
            (this.gamemode == "remote" && piece.userData.color == this.my)
        );
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

    onClick(event) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        const objects = this.raycaster.intersectObjects(this.scene.children);

        const piece = objects.find((value) => value.object.parent.name.startsWith("Piece"));
        const chessBoard = objects.find((value) => value.object.name == "Chess_Board");

        // console.log(objects);

        /** @type {Coords} */
        let coords = undefined;

        if (piece && piece != this.pieceInMove) {
            coords = piece.object.parent.userData.pos;
        } else if (chessBoard) {
            coords = Coords.fromWorldPos({ x: chessBoard.point.x, z: chessBoard.point.z });
        }

        if (coords) {
            const index = coords.toIndex();
            const pieceAtPos = this.board[index];

            if (this.pieceInMove == null) {
                if (pieceAtPos != null && this.allowedToMove(pieceAtPos)) {
                    const availableMoveIndices = pieceAtPos.userData.availableMoves.map((value) =>
                        Coords.fromShorthand(value).toIndex()
                    );

                    this.pieceInMove = pieceAtPos;

                    this.selectionOutlinePass.selectedObjects = [this.pieceInMove];
                    this.hoverOutlinePass.selectedObjects = [];
                    this.moveOutlinePass.selectedObjects = this.tiles.filter((value, index) =>
                        availableMoveIndices.includes(index)
                    );
                }
            } else {
                if (pieceAtPos == null && this.canMove(this.pieceInMove, coords)) {
                    const piece = this.pieceInMove;

                    this.board[this.pieceInMove.userData.pos.toIndex()] = undefined;
                    this.board[index] = piece;

                    this.pieceInMove = null;

                    this.move(piece, coords.toShorthand());

                    piece.userData.pos = coords;
                    piece.userData.hasMoved = true;
                    this.moveTo(piece, coords);

                    this.selectionOutlinePass.selectedObjects = [];
                    this.moveOutlinePass.selectedObjects = [];
                } else if (
                    pieceAtPos != null &&
                    !this.allowedToMove(pieceAtPos) &&
                    this.canMove(this.pieceInMove, coords)
                ) {
                    const piece = this.pieceInMove;
                    const opponentPiece = pieceAtPos;

                    this.board[this.pieceInMove.userData.pos.toIndex()] = undefined;
                    this.board[index] = piece;

                    this.pieceInMove = null;

                    this.move(piece, coords.toShorthand());

                    piece.userData.pos = coords;
                    piece.userData.hasMoved = true;
                    this.moveTo(piece, coords);

                    this.scene.remove(opponentPiece);

                    this.selectionOutlinePass.selectedObjects = [];
                    this.moveOutlinePass.selectedObjects = [];
                } else if (pieceAtPos != null && this.allowedToMove(pieceAtPos)) {
                    this.pieceInMove = pieceAtPos;
                    this.selectionOutlinePass.selectedObjects = [this.pieceInMove];

                    const availableMoveIndices = pieceAtPos.userData.availableMoves.map((value) =>
                        Coords.fromShorthand(value).toIndex()
                    );

                    this.moveOutlinePass.selectedObjects = this.tiles.filter((value, index) =>
                        availableMoveIndices.includes(index)
                    );
                }
            }
        }
    }

    onPointerMove(event) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
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
            const piece = this.get(coords.x, coords.y);

            if (piece && this.pieceInMove != piece) {
                this.hoverOutlinePass.selectedObjects = [piece];
            } else {
                this.hoverOutlinePass.selectedObjects = [];
            }
        } else {
            this.box.visible = false;
        }
    }

    async init() {
        this.scene = new THREE.Scene();

        // Add tiles highlight
        {
            /** @type {Array<THREE.Object3D>} */
            this.tiles = new Array(8 * 8);
            const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });

            for (var x = 0; x < 8; x++) {
                for (var y = 0; y < 8; y++) {
                    const tile = new THREE.Mesh(new THREE.PlaneGeometry(tileSize, tileSize, 1, 1));
                    const worldPos = Coords.from(x, y).toWorldPos();

                    tile.position.x = worldPos.x;
                    tile.position.y = -3.5;
                    tile.position.z = worldPos.z;

                    tile.rotation.x = -Math.PI / 2;

                    tile.material = material;

                    this.scene.add(tile);
                    this.tiles[x + y * 8] = tile;
                }
            }
        }

        this.fbxLoader = new FBXLoader();

        // Load models
        {
            /** @type {Map<string, THREE.Object3D>} */
            this.models = new Map();

            this.models.set(
                "pawn",
                await this.loadModelWithParams("/models/chess/PawnMesh.fbx", 0.01, { y: -2.2, z: 0 })
            );
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
                await this.loadModelWithParams(
                    "/models/chess/KingMesh.fbx",
                    0.015,
                    { y: -0.5, z: 0 },
                    { y: Math.PI / 2 }
                )
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
        }

        this.raycaster = new THREE.Raycaster();

        /** @type {Array<THREE.Object3D>} */
        this.board = new Array(8 * 8);

        /**
         * The piece currently being moved if any.
         * @type {THREE.Object3D}
         */
        this.pieceInMove = null;

        this.turn = "white";
        /** @type {string} */
        this.color = undefined;

        this.onready = async () => {
            const c = document.getElementById("chess");

            this.camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
            let renderer = new THREE.WebGLRenderer();

            renderer.setSize(c.clientWidth, c.clientHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;

            window.addEventListener(
                "resize",
                () => {
                    this.camera.aspect = c.clientWidth / c.clientHeight;
                    this.camera.updateProjectionMatrix();

                    renderer.setSize(c.clientWidth, c.clientHeight);
                    this.composer.setSize(c.clientWidth, c.clientHeight);

                    this.fxaaPass.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
                },
                false
            );

            c.appendChild(renderer.domElement);

            renderer.setClearColor("blue");

            const controls = new OrbitControls(this.camera, c);

            this.camera.position.z = -25;
            this.camera.position.y = 20;

            // Add lighting to the scene
            {
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                this.scene.add(ambientLight);

                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(0, 20, 0);
                this.scene.add(directionalLight);
            }

            // Add the board
            const board = await this.fbxLoader.loadAsync("/models/chess/Chess Board.fbx");
            board.position.set(0, -4.75, 0);
            board.receiveShadow = true;
            this.scene.add(board);

            // Place a box which will be use to highlight the current tile
            {
                this.box = this.debuggingBox(Coords.fromShorthand("D4").toWorldPos(), 3.95, 6.0, 3.95);
                this.box.object.position.y = -0.595;
                this.box.visible = false;
                this.scene.add(this.box);
            }

            // Add outline passes
            {
                this.composer = new EffectComposer(renderer);

                const renderPass = new RenderPass(this.scene, this.camera);
                this.composer.addPass(renderPass);

                // Outline when a piece is hovered
                this.hoverOutlinePass = new OutlinePass(
                    new THREE.Vector2(c.clientWidth, c.clientHeight),
                    this.scene,
                    this.camera
                );
                this.hoverOutlinePass.visibleEdgeColor.set("orange");
                this.hoverOutlinePass.hiddenEdgeColor.set("orange");
                this.hoverOutlinePass.edgeThickness = 1.0;
                this.hoverOutlinePass.edgeGlow = 0.0;
                this.hoverOutlinePass.edgeStrength = 10.0;
                this.hoverOutlinePass.overlayMaterial.blending = THREE.CustomBlending;
                this.composer.addPass(this.hoverOutlinePass);

                // Outline when a piece is selected
                this.selectionOutlinePass = new OutlinePass(
                    new THREE.Vector2(c.clientWidth, c.clientHeight),
                    this.scene,
                    this.camera
                );
                this.selectionOutlinePass.visibleEdgeColor.set("orange");
                this.selectionOutlinePass.hiddenEdgeColor.set("orange");
                this.selectionOutlinePass.edgeThickness = 1.0;
                this.selectionOutlinePass.edgeGlow = 0.0;
                this.selectionOutlinePass.edgeStrength = 10.0;
                this.selectionOutlinePass.overlayMaterial.blending = THREE.CustomBlending;
                this.composer.addPass(this.selectionOutlinePass);

                // Outline for available moves
                this.moveOutlinePass = new OutlinePass(
                    new THREE.Vector2(c.clientWidth, c.clientHeight),
                    this.scene,
                    this.camera
                );
                this.moveOutlinePass.visibleEdgeColor.set("green");
                this.moveOutlinePass.hiddenEdgeColor.set("green");
                this.moveOutlinePass.edgeThickness = 1.0;
                this.moveOutlinePass.edgeGlow = 0.0;
                this.moveOutlinePass.edgeStrength = 10.0;
                this.moveOutlinePass.overlayMaterial.blending = THREE.CustomBlending;
                // this.moveOutlinePass.pulsePeriod = 15.0;
                this.composer.addPass(this.moveOutlinePass);

                const outputPass = new OutputPass();
                this.composer.addPass(outputPass);

                this.fxaaPass = new ShaderPass(FXAAShader);
                this.fxaaPass.uniforms["resolution"].value.set(1 / c.clientWidth, 1 / c.clientHeight);
                this.composer.addPass(this.fxaaPass);
            }

            renderer.setAnimationLoop(() => {
                this.box.update();

                controls.update();
                renderer.render(this.scene, this.camera);
                this.composer.render();
            });

            c.addEventListener("click", (event) => this.onClick(event));
            c.addEventListener("pointermove", (event) => this.onPointerMove(event));

            // Open the websocket and do stuff with it.
            this.ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/chess/1`);

            this.ws.onopen = () => {};

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);

                if (data.type == "info") {
                    for (let pieceData of data.info.pieces) {
                        this.placePiece(pieceData.type, pieceData.pos, pieceData.color);

                        const coords = Coords.fromShorthand(pieceData.pos);
                        this.board[coords.toIndex()].userData.availableMoves = pieceData.moves ? pieceData.moves : [];
                    }

                    this.gamemode = data.gamemode;
                    this.color = data.color;
                    this.turn = data.turn;
                } else if (data.type == "move" || data.type == "take") {
                    for (let pieceData of data.info.pieces) {
                        const coords = Coords.fromShorthand(pieceData.pos);
                        this.board[coords.toIndex()].userData.availableMoves = pieceData.moves ? pieceData.moves : [];
                    }

                    this.turn = data.turn;
                }
            };
        };
    }

    render() {
        return /* HTML */ `<HomeNavBar />
            <div id="chess"></div>`;
    }
}

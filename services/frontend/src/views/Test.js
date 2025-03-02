import { Component } from "../micro";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ParticleSystem } from "../ParticleSystem";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

// https://www.youtube.com/watch?v=oKbCaj1J6EI
// https://github.com/franky-adl/voronoi-sphere/blob/main/src/shaders/voronoi3d_basic.glsl
// https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/

// Uniforms are variables that have the same value for all vertices - lighting, fog, and shadow maps are examples of data that would be stored in uniforms.
// Uniforms can be accessed by both the vertex shader and the fragment shader.

// Attributes are variables associated with each vertex---for instance, the vertex position, face normal, and vertex color are all examples of data that would be stored in attributes.
// Attributes can only be accessed within the vertex shader.

// Varyings are variables that are passed from the vertex shader to the fragment shader.For each fragment, the value of each varying will be smoothly interpolated from the values of adjacent vertices.

async function loadShaderFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader file: ${url}`);
    }
    return await response.text();
}

export default class BrittleHollow extends Component {
    async init() {
        this.onready = async () => {
            this.c = document.getElementById("test");

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(70, this.c.clientWidth / this.c.clientHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer();

            this.controls = new OrbitControls(this.camera, this.c);

            this.camera.position.z = 20;
            this.camera.position.y = -2;

            this.renderer.setSize(this.c.clientWidth, this.c.clientHeight);
            this.c.appendChild(this.renderer.domElement);

            this.renderer.setClearColor(0x000000);

            // Set up post-processing for the ball scene.
            this.ballComposer = new EffectComposer(this.renderer);
            this.ballRenderPass = new RenderPass(this.scene, this.camera);
            this.ballComposer.addPass(this.ballRenderPass);

            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(this.c.clientWidth, this.c.clientHeight),
                0.1, // strength
                0.4, // radius
                0.85 // threshold
            );
            this.ballComposer.addPass(this.bloomPass);

            // https://discourse.threejs.org/t/gltfloader-and-rgbeloader-adding-hdr-texture-to-enviroment/36086
            // https://ambientcg.com/list?type=hdri&sort=popular

            const exrLoader = new EXRLoader();
            exrLoader.load("/models/BrittleHollow/4k.exr", async (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;

                // We cannot use same texture for different purpose, so I can clone them.
                const envTexture = texture.clone();
                const bgTexture = texture.clone();

                this.scene.environment = envTexture;
                this.scene.background = bgTexture;

                this.gltfLoader = new GLTFLoader();
                this.piece = (
                    await this.gltfLoader.loadAsync("/models/BrittleHollow/BrittleHollowTerrainPiece.glb")
                ).scene;
                this.piece.children[0].material = new THREE.ShaderMaterial({
                    vertexShader: await loadShaderFile("/models/BrittleHollow/TerrainPieceVert.glsl"),
                    fragmentShader: await loadShaderFile("/models/BrittleHollow/TerrainPieceFrag.glsl"),
                    uniforms: {
                        u_emissiveColor: { value: new THREE.Color("#d1718e") },
                        u_emissiveIntensity: { value: 1.0 },
                        u_opacity: { value: 1.0 },
                        u_envMap: { value: texture },
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

                this.scene.add(this.piece);
            });

            this.renderer.setAnimationLoop(() => {
                this.controls.update();

                this.ballComposer.render(this.scene, this.camera);
            });
        };
    }

    render() {
        return /* HTML */ ` <div id="test"></div> `;
    }
}

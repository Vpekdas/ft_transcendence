import { Component } from "../micro";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ParticleSystem } from "../ParticleSystem";

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

export default class Test extends Component {
    async initGround(scene) {
        const vertexShader = await loadShaderFile("/models/BrittleHollow/Ground/vertexShader.glsl");
        const fragmentShader = await loadShaderFile("/models/BrittleHollow/Ground/fragmentShader.glsl");

        const customShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                u_time: { value: 1.0 },
                u_bFactor: { value: 2.0 },
                u_pcurveHandle: { value: 1.0 },
                u_scale: { value: 0.4 },
                u_roughness: { value: 1.0 },
                u_detail: { value: 1.0 },
                u_randomness: { value: 1.0 },
                u_lacunarity: { value: 1.0 },
            },
            side: THREE.DoubleSide,
        });

        const cuboidGeometry = new THREE.BoxGeometry(20, 1, 20);
        const cuboid = new THREE.Mesh(cuboidGeometry, customShaderMaterial);
        scene.add(cuboid);

        return cuboid;
    }

    async initQuantumShard(scene) {
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

        const quantumShardLoader = new GLTFLoader();
        quantumShardLoader.load("/models/BrittleHollow/QuantumShard/QuantumShard.glb", (gltf) => {
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

            // TODO: Ensure it not make the game unplayable or maybe make it appear randomly ?
            quantumShard.position.set(THREE.MathUtils.randInt(-9, 9), 0, THREE.MathUtils.randInt(-9, 9));
            scene.add(quantumShard);
            return quantumShard;
        });
    }

    async initCampfire(scene) {
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

        const campfireLoader = new GLTFLoader();
        campfireLoader.load("/models/BrittleHollow/Campfire/Campfire.glb", async (gltf) => {
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

            campfire.position.set(THREE.MathUtils.randInt(-6, 6), 0.5, THREE.MathUtils.randInt(-6, 6));
            campfire.rotation.set(0, THREE.MathUtils.randInt(-360, 360), 0);
            campfire.scale.set(3, 3, 3);
            scene.add(campfire);
            return campfire;
        });
    }

    async initDeadTree(DeadTreeNumber, scene) {
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

        const loader = new GLTFLoader();
        loader.load("/models/BrittleHollow/DeadTree/DeadTree.glb", (gltf) => {
            for (let i = 0; i < DeadTreeNumber; i++) {
                const tree = gltf.scene.clone();
                tree.traverse((child) => {
                    if (child.isMesh) {
                        child.material = deadTreeCustomShaderMaterial;
                    }
                });

                tree.position.set(THREE.MathUtils.randInt(-9, 9), 0.5, THREE.MathUtils.randInt(-9, 9));
                tree.rotation.set(0, THREE.MathUtils.randInt(-360, 360), 0);
                tree.scale.set(0.5, 0.5, 0.5);
                scene.add(tree);
            }
        });
    }

    async initMeteorite(scene, x, y, z, fireCustomShaderMaterial) {
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(20, 4), fireCustomShaderMaterial);

        mesh.position.set(x, y, z);
        mesh.scale.set(0.1, 0.1, 0.1);
        scene.add(mesh);
        return mesh;
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

    async initBall(scene, x, y, z) {
        const ballVertexShader = await loadShaderFile("/models/BrittleHollow/Ball/vertexShader.glsl");
        const ballFragmentShader = await loadShaderFile("/models/BrittleHollow/Ball/fragmentShader.glsl");

        const ballCustomShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: ballVertexShader,
            fragmentShader: ballFragmentShader,
            uniforms: {
                emissiveIntensity: { value: 15.0 },
            },
        });

        const geometry = new THREE.SphereGeometry();
        const ball = new THREE.Mesh(geometry, ballCustomShaderMaterial);

        ball.position.set(x, y, z);
        scene.add(ball);
        return ball;
    }

    async init() {
        this.onready = async () => {
            const c = document.getElementById("test");

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer();

            this.controls = new OrbitControls(this.camera, c);

            this.camera.position.z = 20;
            this.camera.position.y = -2;

            this.renderer.setSize(c.clientWidth, c.clientHeight);
            c.appendChild(this.renderer.domElement);

            this.renderer.setClearColor(0x000000);

            this.ground = await this.initGround(this.scene);
            this.quantumShard = await this.initQuantumShard(this.scene);
            this.campfire = await this.initCampfire(this.scene);
            await this.initDeadTree(9, this.scene);

            this.fireCustomShaderMaterial = await this.initFireShader();
            this.meteorite = await this.initMeteorite(this.scene, 2, 2, 2, this.fireCustomShaderMaterial);
            this.ball = await this.initBall(this.scene, 0, 2, 0);

            const particleVertexShader = await loadShaderFile("/models/BrittleHollow/particlevertexShader.glsl");
            const particleFragmentShader = await loadShaderFile("/models/BrittleHollow/particlefragmentShader.glsl");

            this.particleSystem = new ParticleSystem({
                parent: this.scene,
                vertexShader: particleVertexShader,
                fragmentShader: particleFragmentShader,
                texture: "/models/BrittleHollow/Fire.jpg",
            });

            const start = Date.now();
            let previousTime = performance.now();

            // Ensure map looks dark.
            this.renderer.toneMapping = THREE.ReinhardToneMapping;
            this.renderer.toneMappingExposure = 0.3;

            // Set up post-processing for the ball scene.
            const ballComposer = new EffectComposer(this.renderer);
            const ballRenderPass = new RenderPass(this.scene, this.camera);
            ballComposer.addPass(ballRenderPass);

            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(c.clientWidth, c.clientHeight),
                1.5, // strength
                0.4, // radius
                0.85 // threshold
            );
            ballComposer.addPass(bloomPass);

            this.renderer.setAnimationLoop(() => {
                this.controls.update();

                this.fireCustomShaderMaterial.uniforms["time"].value = 0.00025 * (Date.now() - start);
                const currentTime = performance.now();
                const timeElapsed = (currentTime - previousTime) / 1000;
                previousTime = currentTime;

                this.particleSystem.step(timeElapsed);

                ballComposer.render(this.scene, this.camera);
            });
        };
    }

    render() {
        return /* HTML */ ` <div id="test"></div> `;
    }
}

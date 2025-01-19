import { tr } from "../i18n";
import { Component, navigateTo } from "../micro";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// https://www.youtube.com/watch?v=oKbCaj1J6EI
// https://github.com/franky-adl/voronoi-sphere/blob/main/src/shaders/voronoi3d_basic.glsl

// Uniforms are variables that have the same value for all vertices - lighting, fog, and shadow maps are examples of data that would be stored in uniforms.
// Uniforms can be accessed by both the vertex shader and the fragment shader.

// Attributes are variables associated with each vertex---for instance, the vertex position, face normal, and vertex color are all examples of data that would be stored in attributes.
// Attributes can only be accessed within the vertex shader.

// Varyings are variables that are passed from the vertex shader to the fragment shader.For each fragment, the value of each varying will be smoothly interpolated from the values of adjacent vertices.

async function loadShaderFile(url) {
    const response = await fetch(url);
    return await response.text();
}

export default class Test extends Component {
    async init() {
        this.onready = async () => {
            const c = document.getElementById("test");

            let scene = new THREE.Scene();
            // let ballScene = new THREE.Scene();
            let groundScene = new THREE.Scene();
            // let DeadTreeScene = new THREE.Scene();

            let camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
            let renderer = new THREE.WebGLRenderer();

            const controls = new OrbitControls(camera, c);

            camera.position.z = 20;
            camera.position.y = -2;

            renderer.setSize(c.clientWidth, c.clientHeight);
            c.appendChild(renderer.domElement);

            renderer.setClearColor(0x87ceeb);

            // ! DeadTree
            // const vertexShader = await loadShaderFile("/models/BrittleHollow/DeadTree/vertexShader.glsl");
            // const fragmentShader = await loadShaderFile("/models/BrittleHollow/DeadTree/fragmentShader.glsl");

            // const customShaderMaterial = new THREE.ShaderMaterial({
            //     vertexShader: vertexShader,
            //     fragmentShader: fragmentShader,
            //     uniforms: {
            //         u_time: { value: 1.0 },
            //         u_bFactor: { value: 1.0 },
            //         u_pcurveHandle: { value: 2.0 },
            //         u_scale: { value: 1.0 },
            //         u_roughness: { value: 1.0 },
            //         u_detail: { value: 1.0 },
            //         u_randomness: { value: 1.0 },
            //         u_lacunarity: { value: 1.0 },
            //     },
            //     side: THREE.DoubleSide, // Render both sides of the plane
            // });

            // const loader = new GLTFLoader();
            // loader.load("/models/BrittleHollow/DeadTree/DeadTree.glb", (gltf) => {
            //     const tree = gltf.scene;
            //     tree.traverse((child) => {
            //         if (child.isMesh) {
            //             child.material = customShaderMaterial;
            //         }
            //     });

            //     DeadTreeScene.add(tree);
            // });

            // ! Ground
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
                side: THREE.DoubleSide, // Render both sides of the plane
            });

            const cuboidGeometry = new THREE.BoxGeometry(10, 1, 10); // Width, Height, Depth
            const cuboid = new THREE.Mesh(cuboidGeometry, customShaderMaterial);
            groundScene.add(cuboid);

            // ! Ball
            // const vertexShader = await loadShaderFile("/models/BrittleHollow/vertexShader.glsl");
            // const fragmentShader = await loadShaderFile("/models/BrittleHollow/fragmentShader.glsl");

            // const customShaderMaterial = new THREE.ShaderMaterial({
            //     vertexShader: vertexShader,
            //     fragmentShader: fragmentShader,
            //     uniforms: {
            //         emissiveIntensity: { value: 15.0 },
            //     },
            // });

            // const geometry = new THREE.SphereGeometry(5, 32, 32);
            // const ball = new THREE.Mesh(geometry, customShaderMaterial);
            // ballScene.add(ball);

            // // Set up post-processing for the ball scene
            // const ballComposer = new EffectComposer(renderer);
            // const ballRenderPass = new RenderPass(ballScene, camera);
            // ballComposer.addPass(ballRenderPass);

            // const bloomPass = new UnrealBloomPass(
            //     new THREE.Vector2(c.clientWidth, c.clientHeight),
            //     1.5, // strength
            //     0.4, // radius
            //     0.85 // threshold
            // );
            // ballComposer.addPass(bloomPass);

            const ambientLight = new THREE.AmbientLight(0xffffff, 10);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(0, 0, 20);
            scene.add(directionalLight);

            renderer.setAnimationLoop(() => {
                controls.update();
                renderer.render(scene, camera);
                renderer.render(groundScene, camera);
                // renderer.render(DeadTreeScene, camera);
                // ballComposer.render();
            });
        };
    }

    render() {
        return /* HTML */ ` <div id="test"></div> `;
    }
}

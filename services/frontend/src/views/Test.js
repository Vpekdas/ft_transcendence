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
            let camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
            let renderer = new THREE.WebGLRenderer();
            const loader = new GLTFLoader();

            const controls = new OrbitControls(camera, c);

            camera.position.z = 20;
            camera.position.y = -2;

            renderer.setSize(c.clientWidth, c.clientHeight);
            c.appendChild(renderer.domElement);

            renderer.setClearColor(0x87ceeb); // Light blue color

            const vertexShader = await loadShaderFile("/models/BrittleHollow/Ground/vertexShader.glsl");
            const fragmentShader = await loadShaderFile("/models/BrittleHollow/Ground/fragmentShader.glsl");

            const customShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: {
                    u_time: { value: 1.0 },
                    u_bFactor: { value: 2.0 },
                    u_pcurveHandle: { value: 1.0 },
                    u_scale: { value: 0.4 }, // Scale of the Voronoi pattern
                    u_roughness: { value: 1.0 }, // Roughness of the Voronoi pattern
                    u_detail: { value: 1.0 }, // Detail level of the Voronoi pattern
                    u_randomness: { value: 1.0 }, // Randomness of the Voronoi pattern
                    u_lacunarity: { value: 1.0 }, // Lacunarity of the Voronoi pattern
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
                renderer.render(groundScene, camera);
                // ballComposer.render();
            });
        };
    }

    render() {
        return /* HTML */ ` <div id="test"></div> `;
    }
}

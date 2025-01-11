import { tr } from "../i18n";
import { navigateTo } from "../micro";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";


// https://www.youtube.com/watch?v=oKbCaj1J6EI

async function loadShaderFile(url) {
    const response = await fetch(url);
    return await response.text();
}

/** @type {import("../micro").Component} */
export default async function Test({ dom }) {
    dom.querySelector("#test").do(async (c) => {
        let scene = new THREE.Scene();
        let ballScene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(70, c.clientWidth / c.clientHeight, 0.1, 1000);
        let renderer = new THREE.WebGLRenderer();
        const textureLoader = new THREE.TextureLoader();

        const spaceTexture = textureLoader.load("/img/space.jpg");
        scene.background = spaceTexture;

        renderer.setSize(c.clientWidth, c.clientHeight);

        c.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, c);

        camera.position.z = 20;
        camera.position.y = -2;

        const vertexShader = await loadShaderFile("/models/vertexShader.glsl");
        const fragmentShader = await loadShaderFile("/models/fragmentShader.glsl");

        const customShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                emissiveIntensity: { value: 15.0 },
            },
        });

        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const ball = new THREE.Mesh(geometry, customShaderMaterial);
        ballScene.add(ball);

        // Set up post-processing for the ball scene
        const ballComposer = new EffectComposer(renderer);
        const ballRenderPass = new RenderPass(ballScene, camera);
        ballComposer.addPass(ballRenderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(c.clientWidth, c.clientHeight),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        ballComposer.addPass(bloomPass);

        // Render loop
        renderer.setAnimationLoop(() => {
            controls.update();
            renderer.render(scene, camera);
            ballComposer.render();
        });
    });

    return /* HTML */ ` <div id="test"></div> `;
}

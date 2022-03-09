import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import GUI from "lil-gui";

import sphereVertexShader from "./shaders/sphereVertex.glsl";
import sphereFragmentShader from "./shaders/sphereFragment.glsl";

const gui = new GUI({ width: "400" });
if (!window.location.search) {
  gui.hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera, new THREE.AxesHelper(5));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sphere
 */
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(1, 512, 512),
  new THREE.ShaderMaterial({
    vertexShader: sphereVertexShader,
    fragmentShader: sphereFragmentShader,
    // wireframe: true,
    uniforms: {
      u_time: { value: null },

      u_distortionFrequency: { value: 1.5 },
      u_distortionScale: { value: 0.65 },
      u_displacementFrequency: { value: 2.12 },
      u_displacementScale: { value: 0.152 },
    },
  })
);
sphere.material.uniforms.u_time.value = 0;
console.log(sphere);
scene.add(sphere);

/**
 * Debug
 */
const perlinFolderGui = gui.addFolder("Perlin noise");
perlinFolderGui.open();
perlinFolderGui
  .add(sphere.material.uniforms.u_distortionFrequency, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("u_distortionFrequency");
perlinFolderGui
  .add(sphere.material.uniforms.u_distortionScale, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("u_distortionScale");
perlinFolderGui
  .add(sphere.material.uniforms.u_displacementFrequency, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("u_displacementFrequency");
perlinFolderGui
  .add(sphere.material.uniforms.u_displacementScale, "value")
  .min(0)
  .max(2)
  .step(0.01)
  .name("u_displacementScale");

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;

  // Update u_time
  sphere.material.uniforms.u_time.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import sphereVertexShader from "./shaders/sphereVertex.glsl";
import sphereFragmentShader from "./shaders/sphereFragment.glsl";
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
 * Sphere
 */
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(1, 64, 64),
  new THREE.ShaderMaterial({
    vertexShader: sphereVertexShader,
    fragmentShader: sphereFragmentShader,
    wireframe: true,
    uniforms: {
      uTime: { value: null },
    },
  })
);
const helper = new VertexNormalsHelper(sphere, 0.05, "#00ff00");
scene.add(helper);
sphere.material.uniforms.uTime.value = 0;
console.log(sphere);
scene.add(sphere);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;

  // Update uTime
  sphere.material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

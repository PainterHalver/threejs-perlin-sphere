import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import GUI from "lil-gui";

// import { initSpectrum, audioContext } from "./utils/spectrum.js";
import Spectrum from "./utils/spectrum.js";

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

camera.position.z = 3.5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false; // Block right click

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// renderer.setClearColor(new THREE.Color("#21130d"));
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sphere
 */

const sphereGeometry = new THREE.SphereBufferGeometry(1, 512, 512);
sphereGeometry.computeTangents();
const sphere = new THREE.Mesh(
  sphereGeometry,
  new THREE.ShaderMaterial({
    vertexShader: sphereVertexShader,
    fragmentShader: sphereFragmentShader,
    // wireframe: true,
    uniforms: {
      u_scale: { value: 1.0 },
      u_time: { value: null },

      u_distortionFrequency: { value: 1.5 },
      u_distortionScale: { value: 0.65 },
      u_displacementFrequency: { value: 2.12 },
      u_displacementScale: { value: 0.152 },

      u_segmentCount: { value: null },

      u_fresnelScale: { value: 2.85 },
      u_fresnelOffset: { value: -1.5 },
    },
    defines: {
      USE_TANGENT: "",
    },
  })
);
sphere.material.uniforms.u_segmentCount.value =
  sphere.geometry.parameters.widthSegments;
sphere.material.uniforms.u_time.value = 0;
scene.add(sphere);

/**
 * Sound
 * https://codepen.io/nfj525/pen/rVBaab
 */

const fileInput = document.getElementById("file-input");
const audio = document.getElementById("audio");
const soundCanvas = document.getElementById("sound-canvas");
let spectrum = null;

audio.addEventListener("play", (e) => {
  if (!spectrum) {
    initSpectrum();
  }
});

fileInput.onchange = function (event) {
  const files = this.files;
  audio.src = URL.createObjectURL(files[0]);
  audio.load();
  audio.play();
  initSpectrum();
};

const initSpectrum = () => {
  spectrum = new Spectrum(audio, soundCanvas);
  updateSphereWithSpectrum();
};

const updateSphereWithSpectrum = () => {
  spectrum.setSphereUpdate(() => {
    const average =
      spectrum.dataArray.reduce((prev, now) => prev + now, 0) /
      spectrum.dataArray.length;

    if (spectrum.lastSpectrums.length > spectrum.MOVING_AVERAGE) {
      spectrum.lastSpectrums.shift();
    }
    spectrum.lastSpectrums.push(average);
    const averageLastSpectrum =
      spectrum.lastSpectrums.reduce((prev, now) => prev + now, 0) /
      spectrum.lastSpectrums.length;

    sphere.material.uniforms.u_scale.value = 1 + averageLastSpectrum * 0.005; // WE HAVE A MAGIC NUMBER HERE
    sphere.material.uniforms.u_distortionFrequency.value =
      1.5 + averageLastSpectrum * 0.01; // WE HAVE A MAGIC NUMBER HERE

    tintPass.material.uniforms.u_tint.value = new THREE.Color(
      0,
      0,
      0
    ).addScalar(averageLastSpectrum / 255);
  });
};

/**
 * Post-Processing
 */
const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding, // Here
});
const effectComposer = new EffectComposer(renderer, renderTarget); // Import not from THREE
// Also add this to the resize callback
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

// Import not from THREE
const renderPass = new RenderPass(scene, camera); // Just like a renderer
// Add pass to composer
effectComposer.addPass(renderPass);
const TintShader = {
  uniforms: {
    // Set it to null and effectComposer will add value to it
    // So we can use it below
    tDiffuse: { value: null },
    u_tint: { value: null },
  },
  vertexShader: `
  varying vec2 vUv;
    
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec3 u_tint;

    void main()
    {
      vec4 color = texture2D(tDiffuse, vUv);

      // https://thebookofshaders.com/07/
      // bottom-left
      vec2 bl = smoothstep(vec2(-0.2), vec2(0.14), vUv);
      float pct = bl.x * bl.y;
  
      // top-right
      vec2 tr = smoothstep(vec2(-0.2), vec2(0.14), 1.0 - vUv);
      pct *= tr.x * tr.y;

      color.rgb += u_tint * (1.0 - pct);
      // color.rgb *= pct;
      gl_FragColor = color;
    }
  `,
};
const tintPass = new ShaderPass(TintShader);
tintPass.material.uniforms.u_tint.value = new THREE.Vector3(0, 0, 0);
effectComposer.addPass(tintPass);

/**
 * Debug
 */
const sphereGui = gui.addFolder("Sphere");
sphereGui.open();
sphereGui
  .add(sphere.material.uniforms.u_scale, "value")
  .min(0.5)
  .max(2)
  .step(0.001)
  .name("u_scale");
sphereGui
  .add(sphere.material.uniforms.u_distortionFrequency, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("u_distortionFrequency");
sphereGui
  .add(sphere.material.uniforms.u_distortionScale, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("u_distortionScale");
sphereGui
  .add(sphere.material.uniforms.u_displacementFrequency, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("u_displacementFrequency");
sphereGui
  .add(sphere.material.uniforms.u_displacementScale, "value")
  .min(0)
  .max(1.5)
  .step(0.01)
  .name("u_displacementScale");
sphereGui
  .add(sphere.material.uniforms.u_fresnelScale, "value")
  .min(0)
  .max(3)
  .step(0.01)
  .name("u_fresnelScale");
sphereGui
  .add(sphere.material.uniforms.u_fresnelOffset, "value")
  .min(-2)
  .max(2)
  .step(0.01)
  .name("u_fresnelOffset");
const tintPassGui = gui.addFolder("Border Tint Pass");
tintPassGui
  .addColor(tintPass.material.uniforms.u_tint, "value")
  .onChange((value) => {
    tintPass.material.uniforms.u_tint.value = new THREE.Color(value);
  });

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
  // renderer.render(scene, camera);
  effectComposer.render();

  // update Spectrum
  if (spectrum) {
    spectrum.renderSpectrum();
  }

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

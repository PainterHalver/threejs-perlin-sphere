uniform float uTime;

varying vec3 vColor;

#define PI 3.1415926538

#pragma glslify: perlin4d = require('./utils/perlin4d.glsl')
#pragma glslify: perlin3d = require('./utils/perlin3d.glsl')

// vec3 getDisplacedPosition(vec3 _position)
// {
//     vec3 distoredPosition = _position;
//     distoredPosition += perlin4d(vec4(distoredPosition * uDistortionFrequency + uOffset, uTime)) * uDistortionStrength;

//     float perlinStrength = perlin4d(vec4(distoredPosition * uDisplacementFrequency + uOffset, uTime));
    
//     vec3 displacedPosition = _position;
//     displacedPosition += normalize(_position) * perlinStrength * uDisplacementStrength;

//     return displacedPosition;
// }

// Home-made
float angle(vec3 a, vec3 b) {
    return acos(dot(a, b) / (length(a) * length(b)));
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Do something with modelPosition.xyz
    // float modValue = 0.01;
    // modelPosition.x *= smoothstep(modValue * 0.1, modValue * 0.5, mod(modelPosition.x, modValue));
    // modelPosition.y *= smoothstep(modValue * 0.1, modValue * 0.5, mod(modelPosition.y, modValue));
    // modelPosition.z *= smoothstep(modValue * 0.1, modValue * 0.5, mod(modelPosition.z, modValue));

    // if (mod(uTime, 0.1) > 0.05) {
    //     modelPosition.xyz += normal * 0.2;
    // }

    // modelPosition.xyz += normal * (sin(uTime * 5.0) *0.5 + 0.5);

    // if (dot(normal, vec3(1,0,0)) < 0.5) {
    //     modelPosition.x += 0.1;
    // }

    // modelPosition.x += angle(normal, vec3(0.0, 0.0, 1.0));

    // if (rand(vec2(1.0, uTime)) > 0.5) {
    //     modelPosition.xyz *= 1.2;
    // }

    // modelPosition.xyz *= (sin(modelPosition.xyz * uTime) * 0.5) + 1.5;

    float delta = (sin(uTime) + 1.0) * 0.5;

    // if (abs(mod(modelPosition.x, 0.05)) > 0.025 && abs(mod(modelPosition.y, 0.05)) > 0.025 && abs(mod(modelPosition.z, 0.05)) > 0.025) {
    //     modelPosition.xyz *= vec3(1.1);
    // }

    // modelPosition.xyz *= (abs(step(0.1, modelPosition.xyz) / 3.0) + 1.0);

    // modelPosition.xyz *= mix(1.0, 1.2, delta);

    // float multiple = (sin(uTime + modelPosition.x) * 0.5) + 1.0;
    // modelPosition.xyz *= multiple;

    // This looks weird af
    // float multiple = (sin(mod(modelPosition.x - modelPosition.y + modelPosition.z + uTime, 0.5)) * 0.5) + 1.0;
    // modelPosition.xyz *= multiple;

    // modelPosition.xyz *= normal;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Varyings
    vColor = modelPosition.xyz;

    /* Notes
    - The normal is already normalized because sphere radius is 1. And that also means normal === modelPosition.xyz
    */
}
uniform float u_time;
uniform float u_distortionFrequency;
uniform float u_distortionScale;
uniform float u_displacementFrequency;
uniform float u_displacementScale;

varying vec3 vColor;

#define PI 3.141592653589793238462643383

#pragma glslify: perlin4d = require('./utils/perlin4d.glsl')
#pragma glslify: perlin3d = require('./utils/perlin3d.glsl')

vec3 doPerlin(vec3 _position) {
    vec3 distortedPosition = _position;

    // 3 factors that define how perlin (or any shaping technique) are scale, frequency and offset
    // Perlin noise in particular needs a small changes for it to look natural like
    distortedPosition += perlin4d(vec4(distortedPosition * u_distortionFrequency, u_time)) * u_distortionScale;

    // When u_displacementFrequency == 0 the sphere beats like a heart
    // uOffset doesn't seem to matter (atually change it a bit, if remove u_time sphere still animate), remove uOffset with u_time -> freeze
    // perlin noise goes 0 -> 1
    // float perlinScale = perlin4d(vec4(distoredPosition * u_displacementFrequency + uOffset, u_time)); // old
    float perlinScale = perlin4d(vec4(distortedPosition * u_displacementFrequency, u_time));
    
    vec3 displacedPosition = _position;
    displacedPosition += normalize(_position) * perlinScale * u_displacementScale;
    // displacedPosition += clamp(normalize(_position) * perlinScale * u_displacementScale * 10.0, -0.1, 999999.0);

    return displacedPosition;
}


float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0); // Uncomment this and last 3 lines for old tests

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Do something with modelPosition.xyz
    // float modValue = 0.01;
    // modelPosition.x *= smoothstep(modValue * 0.1, modValue * 0.5, mod(modelPosition.x, modValue));
    // modelPosition.y *= smoothstep(modValue * 0.1, modValue * 0.5, mod(modelPosition.y, modValue));
    // modelPosition.z *= smoothstep(modValue * 0.1, modValue * 0.5, mod(modelPosition.z, modValue));

    // if (mod(u_time, 0.1) > 0.05) {
    //     modelPosition.xyz += normal * 0.2;
    // }

    // modelPosition.xyz += normal * (sin(u_time * 5.0) *0.5 + 0.5);

    // if (dot(normal, vec3(1,0,0)) < 0.5) {
    //     modelPosition.x += 0.1;
    // }

    // modelPosition.x += angle(normal, vec3(0.0, 0.0, 1.0));

    // if (rand(vec2(1.0, u_time)) > 0.5) {
    //     modelPosition.xyz *= 1.2;
    // }

    // modelPosition.xyz *= (sin(modelPosition.xyz * u_time) * 0.5) + 1.5;

    float delta = (sin(u_time) + 1.0) * 0.5;

    // if (abs(mod(modelPosition.x, 0.05)) > 0.025 && abs(mod(modelPosition.y, 0.05)) > 0.025 && abs(mod(modelPosition.z, 0.05)) > 0.025) {
    //     modelPosition.xyz *= vec3(1.1);
    // }

    // modelPosition.xyz *= (abs(step(0.1, modelPosition.xyz) / 3.0) + 1.0);

    // modelPosition.xyz *= mix(1.0, 1.2, delta);

    // float multiple = (sin(u_time + modelPosition.x) * 0.5) + 1.0;
    // modelPosition.xyz *= multiple;

    // This looks weird af
    // float multiple = (sin(mod(modelPosition.x - modelPosition.y + modelPosition.z + u_time, 0.5)) * 0.5) + 1.0;
    // modelPosition.xyz *= multiple;

    // modelPosition.xyz *= normal;

    // float multiple = (sin(distance(modelPosition.xyz, vec3(1.0,0.0,0.0))) * 0.5) + 1.0; // 0.5 to 1.5
    // modelPosition.xyz *= multiple;

    // if (modelPosition.xyz == vec3(1.0,1.0,1.0)) {
    //     modelPosition.xyz *= 2.0;
    // }

    // modelPosition.xyz *= dot(normalize(normal), normalize(modelPosition.xyz));

    // float multiple = sin(abs(modelPosition.x) + abs(modelPosition.y) + abs(modelPosition.z)) / 3.0 + 1.0;
    // modelPosition.xyz *= multiple;

    // modelPosition.xyz *= (sin(rand(modelPosition.xy)) * 0.5) + 1.0;

    // float multiple = mod(distance(uv, vec2(0, 0)), 0.1) * 10.0;
    // modelPosition.xyz *= (1.0 + multiple);

    //cool
    // float multiple = abs(mod(uv.x, 0.1)) + abs(mod(uv.y, 0.1));
    // modelPosition.xyz *= (1.0 + multiple);

    // float multiple = abs(mod(uv.x, 0.05)) * abs(mod(uv.y, 0.05)) * 100.0;
    // modelPosition.xyz *= (1.0 + multiple);

    // Bumpy, working
    // float multiple = abs(smoothstep(0.0, 0.03, mod(uv.x, 0.05))) * abs((smoothstep(0.0, 0.03, mod(uv.y, 0.05)))) * 0.1;
    // modelPosition.xyz *= (1.0 + multiple);

    // Like a butt
    // float multiple = abs(sin(uv.x * PI * 2.0));
    // modelPosition.xyz *= (1.0 + multiple);

    // if (modelPosition.x > 0.5 && modelPosition.y > 0.5 && modelPosition.z > 0.5) {
    //     modelPosition.xyz *= 2.0;
    // }

    // float multiple = abs(smoothstep(0.0, 0.05, mod(sin(uv.x * PI * 0.05 * 10.0), 0.05))) * abs((smoothstep(0.0, 0.05, mod(sin(uv.y * PI * 0.05 * 10.0), 0.05)))) * 0.1;
    // modelPosition.xyz *= (1.0 + multiple);

    // float intensity = 0.1;
    // float timity = 0.1;
    // float multiple = intensity * sin(uv.x * timity) * intensity * sin(uv.y * timity);
    // modelPosition.xyz *= (1.0 + multiple);

    // For god's sake what is this
    // float perlin = perlin4d(vec4(modelPosition.xyz, u_time));
    // modelPosition.xyz *= (clamp(perlin, 0.5, perlin) + 1.0);

    // Also uncomment these
    // vec4 viewPosition = viewMatrix * modelPosition;
    // vec4 projectedPosition = projectionMatrix * viewPosition;
    // gl_Position = projectedPosition;
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Perlin last try :)
    vec3 currentPosition = doPerlin(position);
    
    vec4 viewPosition = viewMatrix * vec4(currentPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;


    // Varyings
    vColor = currentPosition;

    /* Notes
    - The normal is already normalized because sphere radius is 1. And that also means normal === modelPosition.xyz
    */
}
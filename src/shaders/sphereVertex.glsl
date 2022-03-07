void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 pos = modelPosition.xyz;

    // Do something with pos


    vec4 viewPosition = viewMatrix * pos;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

}
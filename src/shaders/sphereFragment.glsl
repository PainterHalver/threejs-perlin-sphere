varying vec3 vColor;

void main() {
    // float strength = length(vColor) / 2.0;


    gl_FragColor = vec4(vColor, 0.9);
}
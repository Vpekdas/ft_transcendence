varying vec3 v_pos;

void main() {
    vec3 groundColor = vec3(0.105, 0.161, 0.227);
    vec3 crystalColor = vec3(209.0 / 255.0, 113.0 / 255.0, 142.0 / 255.0);

    float t = -0.5;

    if (v_pos.y > t) {
        gl_FragColor = vec4(groundColor, 1.0);
    } else {
        gl_FragColor = vec4(crystalColor, 1.0);
    }
}

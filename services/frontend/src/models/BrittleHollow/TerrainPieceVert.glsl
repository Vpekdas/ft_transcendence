varying vec3 v_pos;
varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() {
    v_pos = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
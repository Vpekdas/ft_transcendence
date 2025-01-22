precision highp float;

uniform sampler2D diffuseTexture;

varying vec2 vAngle;

void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    vec4 textureColor = texture2D(diffuseTexture, coords);
    gl_FragColor = textureColor;
}
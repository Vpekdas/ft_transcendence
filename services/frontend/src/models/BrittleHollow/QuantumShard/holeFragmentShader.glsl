precision mediump float;

varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform vec3 u_emissiveColor;
uniform float u_emissiveIntensity;
uniform float u_opacity;

// https://learnopengl.com/code_viewer_gh.php?code=src/6.pbr/2.2.2.ibl_specular_textured/2.2.2.pbr.fs

float fresnelSchlick(float cosTheta, float F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = fresnelSchlick(dot(viewDir, normal), 0.04);

    vec3 emissiveColor = u_emissiveColor * u_emissiveIntensity * fresnel;

    gl_FragColor = vec4(emissiveColor, u_opacity);
}
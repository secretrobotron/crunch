
precision mediump float;
varying vec4 viewSpacePos;
varying vec2 texCoords;

uniform sampler2D uTexture;

void main(void) {
    float f = 0.5*sin(viewSpacePos.y);
    float g = texCoords.x;
    vec4 texColor = texture2D(uTexture, vec2(texCoords.x, texCoords.y));
    gl_FragColor = texColor;
}
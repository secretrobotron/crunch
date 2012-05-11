
attribute vec3 aVertexPosition;
attribute vec2 aTexCoordinates;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTileWidth;
uniform float uTileHeight;
uniform float uLine;
uniform float uRow;

varying vec4 viewSpacePos;
varying vec2 texCoords;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  viewSpacePos = gl_Position;
  texCoords.x = (aTexCoordinates.x + uRow) * uTileWidth;
  texCoords.y = (aTexCoordinates.y-uLine)*uTileHeight  + 1.0 - uTileHeight;
}
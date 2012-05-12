varying vec4 worldCoord;
uniform float uShadowIndex;

void main(void) {
  vec2 tc = cubicvr_texCoord();
  vertexTexCoordOut = tc;
  worldCoord = matrixProjection * matrixModelView * cubicvr_transform();
  gl_Position = worldCoord;
  vertexNormalOut = matrixNormal * cubicvr_normal();
  cubicvr_lighting();  
}

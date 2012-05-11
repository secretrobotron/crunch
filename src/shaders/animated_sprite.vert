uniform float uNumCols;
uniform float uNumRows;
uniform float uCol;
uniform float uRow;

void main(void) {
  vec2 tc = cubicvr_texCoord();

  vec2 rjij = vec2(uCol, uRow);

  tc.x = (tc.x + uCol) / uNumCols;
  tc.y = (-1.0 + tc.y - uRow) / uNumRows;

  vertexTexCoordOut = tc;
  
  gl_Position = matrixProjection * matrixModelView * cubicvr_transform();

  vertexNormalOut = matrixNormal * cubicvr_normal();

  cubicvr_lighting();  
}

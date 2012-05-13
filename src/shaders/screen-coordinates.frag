varying vec4 worldCoord;
uniform float uShadowIndex;
uniform float uYFactor;
uniform float uYOffset;

void main(void) {
  vec2 texCoord = cubicvr_texCoord();

  vec4 color;
  float dumb = uShadowIndex;
  float c = worldCoord.y/uYFactor + uYOffset;
  //c += fract(sin(dot(texCoord.xy ,vec2(12.9898,78.233))) * 43758.5453) * 0.1;
  c = clamp(c, 0.0, 0.7);
  color.r = color.b = 0.0;
  color.b = c /0.5;
  color.g = c;
  color.a = 1.0;

  vec3 normal = cubicvr_normal(texCoord);
  color = cubicvr_environment(color, normal,texCoord);
  color = cubicvr_lighting(color, normal, texCoord);

  gl_FragColor = color;
}

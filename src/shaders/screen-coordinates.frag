varying vec4 worldCoord;
uniform float uShadowIndex;
uniform float uYFactor;
uniform float uYOffset;

void main(void) {
  vec2 texCoord = cubicvr_texCoord();

  vec4 color;
  float c = worldCoord.y/uYFactor + sin(uShadowIndex) * 0.1 + cos(worldCoord.x*(0.1 + sin(uShadowIndex)*0.1) + uShadowIndex)*0.15 + uYOffset;
  c += fract(sin(dot(texCoord.xy ,vec2(12.9898,78.233))) * 43758.5453) * 0.1;
  c = clamp(c, 0.0, 0.7);
  color.r = color.g = color.b = c;
  color.a = 1.0;

  vec3 normal = cubicvr_normal(texCoord);
  color = cubicvr_environment(color, normal,texCoord);
  color = cubicvr_lighting(color, normal, texCoord);

  gl_FragColor = color;
}